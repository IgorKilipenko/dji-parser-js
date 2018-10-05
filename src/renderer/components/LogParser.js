import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';

import { remote } from 'electron';
const { dialog, BrowserWindow } = remote;
//const win = new BrowserWindow();
const win = remote.getCurrentWindow();

//const DJIParser = remote.require('./main').DJIParser;
const fs = remote.require('fs');
const path = remote.require('path');
//const logger = remote.require('./main').logger;

import DJIParser from '../../common/dji-log-parser';
//import fs from 'fs';
//import path from 'path';
import logger from '../../common/logger';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
        maxWidth: 300
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    chip: {
        margin: theme.spacing.unit / 4
    }
});
const types = [
    'OSD',
    'HOME',
    'GIMBAL',
    'RC',
    'CUSTOM',
    'DEFORM',
    'CENTER_BATTERY',
    'SMART_BATTERY',
    'APP_TIP',
    'APP_WARN',
    'RC_GPS',
    'RC_DEBUG',
    'RECOVER',
    'APP_GPS',
    'FIRMWARE',
    'OFDM_DEBUG',
    'VISION_GROUP',
    'VISION_WARN',
    'MC_PARAM',
    'APP_OPERATION',
    'END',
    'OTHER'
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250
        }
    }
};

class Root extends React.Component {
    constructor() {
        super();
        this.state = { fileName: null, data: [], parsingErrors: [], sectionName: [] };
    }

    componentWillMount = () => {};

    onFileOpen = () => {
        dialog.showOpenDialog(
            win,
            {
                title: 'Select log file (*.DAT)',
                filters: [{ name: 'DJI Log file', extensions: ['DAT', 'txt'] }],
                properties: ['openFile']
            },
            filename => {
                filename && filename.length > 0 ? this.setState({ fileName: filename[0] }) : this.setState({ fileName: null });
            }
        );
    };

    onFileExport = () => {
        dialog.showSaveDialog(
            win,
            {
                title: 'Select folder (*.DAT)',
                filters: [{ name: 'DJI Log file', extensions: ['txt'] }]
            },
            async filename => {
                if (filename && filename.length > 0) {
                    try {
                        await this.exportToFile(filename);
                    } catch (err) {
                        //logger.error(err, this);
                    }
                }
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

    exportToFile = filename => {
        return new Promise(async (resolve, reject) => {
            const parser = new DJIParser();
            const srcData = await this.readFile();
            let bufferData = [];
            let table = new Map();
            types.forEach(type => {
                parser.on(type, async (customData, offset) => {
                    let res = await customData.getAllData();
                    res = Object.entries(res);
                    //logger.debugTrace(`--> Result`, res, this)
                    const lines = new Array(res.length);
                    try {
                        let i = 0;
                        for (const [name, content] of res) {
                            lines[i] = `${i++ > 0 && '\t'}${name} = ${JSON.stringify(content)}`;
                            const column = table.get(name);
                            if (column) {
                                column.push({ content, offset });
                            } else {
                                table.set(name, [{ content, offset }]);
                            }
                        }
                        fs.appendFileSync(filename, lines.join('\t') + '\n');
                    } catch (err) {
                        reject(err);
                    }
                });
            });
            parser.parse(srcData);
            resolve();
        });
    };

    setToTable = (name, value) => {};
    parse = async () => {
        if (this.state.sectionName.length === 0) {
            return null;
        }
        const parser = new DJIParser();
        let bufferData = [];
        this.state.sectionName.forEach(type => {
            parser.on(type, content => {
                const buff = [];
                buff.push({ type, content: this.osdParse(content) });
                bufferData = [...bufferData, ...buff];
            });
        });
        //logger.debugTrace('--> Start parsing', this);
        const data = await this.readFile();
        parser.parse(data);
        this.setState(prevState => {
            return { data: bufferData.slice(0, 2000) };
        });
    };

    osdParse = obj => {
        const o = obj;
        const res = [];
        for (; obj != null; obj = Object.getPrototypeOf(obj)) {
            const op = Object.getOwnPropertyNames(obj);
            for (var i = 0; i < op.length; i++)
                if (res.indexOf(op[i]) == -1) {
                    const name = op[i];
                    if (name === 'valueOf') {
                        continue;
                    }
                    const func = obj[op[i]];
                    try {
                        //p.push(`${op[i]}\t${typeof obj[op[i]] === 'function' && obj[op[i]].apply(o)}`);
                        if (typeof func === 'function' && func.length === 0) {
                            let value = func.apply(o) || '';
                            value = JSON.stringify(value);
                            res.push({ name, value });
                        }
                    } catch (err) {
                        //logger.error(err, this);
                    }
                }
        }

        return res;
    };
    handleSelectedChange = event => {
        this.setState({ sectionName: event.target.value });
    };
    render = () => {
        const { classes, theme } = this.props;
        return (
            <div>
                <div>
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="select-multiple-chip">Chip</InputLabel>
                        <Select
                            multiple
                            value={this.state.sectionName}
                            onChange={this.handleSelectedChange}
                            input={<Input id="select-multiple-chip" />}
                            renderValue={selected => {
                                return (
                                    <div className={classes.chips}>
                                        {selected.map(value => (
                                            <Chip key={value} label={value} className={classes.chip} />
                                        ))}
                                    </div>
                                );
                            }}
                            MenuProps={MenuProps}
                        >
                            {types.map(type => (
                                <MenuItem
                                    key={type}
                                    value={type}
                                    style={{
                                        fontWeight:
                                            this.state.sectionName.indexOf(type) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
                                    }}
                                >
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                <Button onClick={() => setImmediate(() => this.onFileExport())}>Экспорт</Button>
                <Button
                    onClick={() => {
                        setImmediate(() => this.onFileOpen());
                    }}
                >
                    Открыть лог
                </Button>
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
                                                <TableCell>
                                                    <Table>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Name</TableCell>
                                                                <TableCell>Value</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {data.content.map((item, i) => (
                                                                <TableRow key={i + key}>
                                                                    <TableCell>{item.name}</TableCell>
                                                                    <TableCell>{item.value && item.value}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };
}

export default withStyles(styles, { withTheme: true })(Root);
