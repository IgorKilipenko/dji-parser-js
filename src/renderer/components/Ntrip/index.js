import React from 'react';
import PropTypes from 'prop-types';
import { NtripClient } from '../../../../libs/ntrip2all-js';

import { remote } from 'electron';
const fs = remote.require('fs');
const path = remote.require('path');
const http = remote.require('http');

import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        minHeight: 300
    },
    textField: {
        width: '100%'
    }
});

class Ntrip extends React.Component {
    clientOptions = {
        port: 2102,
        host: '82.202.202.138',
        mountpoint: 'KOCH',
        user: 'sbr5037',
        password: '940172'
    };
    serverOptions = {};
    client = null;

    state = {
        clientConnected: false
    };
    startNtrip = async () => {
        const options = {
            method: 'GET',
            port: 2102,
            host: '82.202.202.138',
            path: '/KOCH',
            mountpoint: 'KOCH',
            auth: 'sbr5037:940172',
            user: 'sbr5037',
            password: '940172',
            headers: {
                'Ntrip-Version': 'Ntrip/2.0',
                'User-Agent': 'NTRIP ExampleClient/2.0',
                Connection: 'close',
                Authorization: 'Basic c2JyNTAzNzo5NDAxNzI='
            }
        };

        const file = 'data.txt';
        const fs = require('fs');
        const writable = fs.createWriteStream('file.txt', { encoding: 'ascii' });

        if (this.client) {
            await this.client.abort();
            this.client.removeAllListeners();
        }
        this.client = new NtripClient(options);
        this.client.on('request', info => {
            console.log({ info });
            this.setState({
                clientConnected: true,
                clientStatusCode: info.statusCode,
                clientHeaders: info.headers
            });
        });

        this.client.on('data', chank => {
            this.setState({
                data: chank
            });
        });

        this.client.on('abort', () => {
            this.setState({
                clientConnected: this.client.isConnected,
                clientStatusCode: null,
                clientHeaders: null
            });
        });

        this.client.request();
    };

    startServer = () => {
        const server = http.createServer(async (req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('okay');
            if (this.client) {
                this.client.abort();
                this.client = null;
            }
            this.client = new NtripClient(this.clientOptions);
            const { headers, statusCode } = await this.client.getInfo();
        });
    };

    render = () => {
        const { classes } = this.props;
        return (
            <div>
                <div>
                    <Button disabled={(this.client && this.client.isConnected) || false} onClick={() => this.startNtrip()}>
                        Start
                    </Button>
                    <Button onClick={async () => this.client && (await this.client.abort())}>Stop</Button>
                    <Button onClick={() => this.startServer()}>Start server</Button>
                </div>
                <div className={classes.container}>
                    <TextField
                        id="outlined-multiline-flexible"
                        label="Data"
                        multiline
                        rowsMax="8"
                        value={this.state.data || ''}
                        className={classes.textField}
                        margin="normal"
                        variant="outlined"
                    />
                </div>
            </div>
        );
    };
}

export default withStyles(styles, { withTheme: true })(Ntrip);
