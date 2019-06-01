import React from 'react';
import PropTypes from 'prop-types';
import { NtripClient } from '../../../../libs/ntrip2all-js';

import { remote } from 'electron';
const fs = remote.require('fs');
const path = remote.require('path');
const http = remote.require('http');
//import http from 'http';

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
    constructor(){
        super();

        let now = new Date();
        let date = ('00' + now.getUTCHours()).slice(-2) + ('00' + now.getUTCMinutes()).slice(-2) + ('00' + now.getUTCSeconds()).slice(-2) + '.' + ('00' + now.getUTCMilliseconds()).slice(-2);


        this.state = {
            clientConnected: false,
            ntripData: '',
            serverStarted: false
        };
        this.serverOptions = {};
        this.client = null;
        this.clientOptions = {
            port: 2102,
            host: '82.202.202.138',
            mountpoint: 'KOCH',
            user: 'sbr5037',
            password: '940172'
        };
        this.topconOptions = {
            host: '82.202.176.56',
            port: 2101,
            user: '57262503',
            password: 'eav4kACe',
            mountpoint: 'AutoRTCM3',
            GPGGA: `GPGGA,${date},5455.598491,N,08255.505364,E,1,10,1.0,120.90,M,-16.271,M,,`
        };
        this.eftOptions = {
            host: '82.202.202.138',
            port: 2102,
            user: 'sbr5037',
            password: '940172',
            mountpoint: 'NVSB3_2'
        }
        
        /* Временно checksum !! ========================================================*/
        let checksum = 0; 
        for(var i = 0; i < this.topconOptions.GPGGA.length; i++) { 
            checksum = checksum ^ this.topconOptions.GPGGA.charCodeAt(i);
        }
        this.topconOptions.GPGGA = `$${this.topconOptions.GPGGA}*${checksum.toString(16).toUpperCase()}`;
        console.log({GPGGA:this.topconOptions.GPGGA});
        /* ============================================================================ */


        this.server;
    }


    startNtrip = async () => {
        /*const options = {
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
        };*/



        const file = 'data.txt';
        const fs = require('fs');
        const writable = fs.createWriteStream('file.txt', { encoding: 'ascii' });

        if (this.client) {
            await this.client.abort();
            this.client.removeAllListeners();
        }
        this.client = new NtripClient(this.eftOptions);
        this.client.on('response', (info, res) => {
            console.log({ info, res });
            this.srcNtripResponse = res;
            this.setState({
                clientConnected: this.client.isConnected,
                clientStatusCode: info.statusCode,
                clientHeaders: info.headers
            });
        });

        this.client.on('data', chank => {
            this.setState({
                ntripData: chank.toString('ascii')
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

    stopServer = () => {
        return new Promise((reslove, reject)=>{
            if (this.server && this.server.listening){
                this.server.close((...v) => {
                    console.log("Server closing", this.server, v);
                    this.server && this.server.unref();
                    this.server = null;
                    this.setState({serverStarted: this.server && this.server.listening});
                    reslove(true);
                });
                
            }else{
                this.server = null;
                reslove(false);
            }

        })

    }
    startServer = async () => {
        await this.stopServer();
        console.assert(this.client && this.client.isConnected, "Client not connected", {client:this.client});
        this.server = http.createServer(async (req, res) => {
            res.write("ICY 200 OK\r\n");
            res.write(this.srcNtripResponse.rawHeaders.join('\r\n') + '\r\n');
            //this.srcNtripResponse.pipe(res);
            this.client.on('data', chank => {
                res.write(chank);
            });
        });
        this.server.on('error', async err => {
            console.error(err, this.server);
            this.setState({serverStarted: this.server && this.server.listening});
        })
        this.server.listen(7048, () => {
            const {address, port} = this.server.address();
            console.log(`Start listen on ${address}:${port}`);
            this.setState({serverStarted:true})
        });

    };

    render = () => {
        const { classes } = this.props;
        return (
            <div>
                <div>
                    <Button disabled={this.state.clientConnected } onClick={() => this.startNtrip()}>
                        {this.state.clientConnected ? this.state.clientStatusCode: 'Start'}
                    </Button>
                    <Button disabled={!this.state.clientConnected } onClick={async () => this.client && (await this.client.abort())}>
                        Stop
                    </Button>
                    <Button onClick={async () => !this.state.serverStarted ? this.startServer(): await this.stopServer()}>
                        {!this.state.serverStarted ? 'Start server' : 'Stop server'}
                    </Button>
                </div>
                <div className={classes.container}>
                    <TextField
                        id="outlined-multiline-flexible"
                        label="Data"
                        multiline
                        rowsMax="8"
                        value={this.state.ntripData}
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
