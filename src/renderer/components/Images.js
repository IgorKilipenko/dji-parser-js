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

import logger from '../../common/logger';
import { remote } from 'electron';
const { dialog, BrowserWindow } = remote;
//const win = new BrowserWindow();
const win = remote.getCurrentWindow();

const fs = remote.require('fs');
const path = remote.require('path');

const styles = theme => ({});

class ImagesExif extends React.Component {
    constructor() {
        super();
    }
    onFileOpen = () => {
        dialog.showOpenDialog(
            win,
            {
                title: 'Select image files',
                filters: [{ name: 'JPEG images', extensions: ['JPG', 'JPEG'] }],
                properties: ['openFile', 'multiSelections']
            },
            filename => {
                filename && filename.length > 0 ? this.setState({ fileName: filename }) : this.setState({ fileName: null });
            }
        );
    }
    render = props => {
        return <Button onClick={this.onFileOpen}>Открыть</Button>;
    };
}

export default withStyles(styles, { withTheme: true })(ImagesExif);
