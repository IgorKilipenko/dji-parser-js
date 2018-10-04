import React from 'react';
import PropTypes from 'prop-types';
import DJIParser from '../../../libs/dji-log-parser';
import fs from 'fs';
import logger from '../../common/logger';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const { dialog } = require('electron').remote;

const styles = theme => ({});
const types = ['OSD'];

class Root extends React.Component {
    constructor() {
        super();
        this.state = { fileName: null, data: [] };
    }

    componentWillMount = () => {};

    onFileOpen = () => {
        dialog.showOpenDialog(
            null,
            {
                title: 'Select log file (*.DAT)',
                filters: [{ name: 'DJI Log file', extensions: ['DAT', 'txt'] }],
                properties: ['properties']
            },
            filename => {
                filename && filename.length > 0 ? this.setState({ fileName: filename[0] }) : this.setState({ fileName: null });
            }
        );
    };

    readFile = () => {
        return new Promise((resolve, reject) => {
            fs.readFile(this.state.fileName, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    };

    parse = async () => {
        const parser = new DJIParser();
        let bufferData = [];
        types.forEach(type => {
            parser.on(type, content => {
                const buff = [];
                type === 'OSD' ? buff.push({ type, content: this.osdToJson(content) }) : buff.push({ type, content });
                bufferData = [...bufferData, ...buff];
            });
        });
        logger.debugTrace('--> Start parsing', this);
        const data = await this.readFile();
        parser.parse(data);
        this.setState(prevState => {
            return { data: bufferData.slice(0, 20) };
        });
    };

    osdToJson = obj => {
        const o = obj;
        const p = [];
        for (; obj != null; obj = Object.getPrototypeOf(obj)) {
            const op = Object.getOwnPropertyNames(obj);
            logger.debugTrace({ op });
            for (var i = 0; i < op.length; i++)
                if (p.indexOf(op[i]) == -1) {
                    const name = op[i];
                    logger.debugTrace({ name });
                    try {
                        p.push(`${op[i]}\t${typeof obj[op[i]] === 'function' && obj[op[i]].apply(o)}`);
                    } catch (err) {
                        logger.error(err, this);
                    }
                }
        }
        const ddd = p.reduce((res, curr) => {
            res += curr + '\n';
            return res;
        }, '');

        logger.debugTrace({ '11111': ddd });
        return ddd;
    };

    render = () => {
        return (
            <div>
                <Button onClick={this.onFileOpen}>Открыть лог</Button>
                {this.state.fileName && (
                    <div>
                        <div>{this.state.fileName}</div>
                        <Button
                            onClick={() => {
                                setImmediate(() => {
                                    this.parse();
                                });
                            }}
                        >
                            Обработать данные
                        </Button>

                        <div>
                            {this.state.data.length > 0 && (
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Data</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {this.state.data.map((data, key) => (
                                            <TableRow key={key}>
                                                <TableCell>{data.type}</TableCell>
                                                <TableCell>{data.content}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                )}
                {/*do {
                    if (this.state.fileName) {
                        <div>
                            <div>{this.state.fileName}</div>
                            <Button onClick={this.readFile}>Обработать данные</Button>
                        </div>
                    }
                    if (this.state.srcData){
                        <div>
                            {this.state.srcData}
                        </div>
                    }
                }*/}
            </div>
        );
    };
}

export default withStyles(styles)(Root);
