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
import ImageGride from './ImageGride';

const exiftool = require('exiftool-vendored').exiftool;
import logger from '../../../common/logger';
import { remote } from 'electron';
const { dialog, BrowserWindow } = remote;
//const win = new BrowserWindow();
const win = remote.getCurrentWindow();

const fs = remote.require('fs');
const path = remote.require('path');

const styles = theme => ({});

class MetadataEditor extends React.Component {
    constructor() {
        super();
    }
    onFileOpen = () => {
        dialog.showOpenDialog(
            win,
            {
                title: 'Select image files',
                filters: [{ name: 'JPEG images', extensions: ['JPG', 'JPEG', 'DNG'] }],
                properties: ['openFile', 'multiSelections']
            },
            filename => {
                filename && filename.length > 0 && this.setState({ imgSet: [] });
                this.loadXmp()
            }
        );
    };

    loadXmp = async file => {
        let tags = null;
        try {
            tags = await exiftool.read(file, '-b');
            let imgPreview = null;
            if (tags){
                this.setState(prebState => {
                    const exifXmpTags = {
                        Latitude: tags.Latitude,
                        Longitude: tags.Longitude,
                        RelativeAltitude: tags.RelativeAltitude,
                        GPSLatitude: tags.GPSLatitude,
                        GPSLongitude: tags.GPSLongitude,
                        GPSAltitude: tags.GPSAltitude,
                        GPSAltitudeRef: tags.GPSAltitudeRef,
                        ImageReview: tags.ImageReview
                    };
                    const buff = [...prebState.imgSet, {file, exifXmpTags}];
                });

            }
        } catch (err) {
            logger.error(err)
        }
    };

    editExif = () => {
        return new Promise(async (reslove, reject) => {
            const files = this.state.imgSet;
            if (!files) {
                reject();
            }
            for (const [file, tags] of files) {
                try {
                    const gpsXmp = {
                        GPSLatitude: tags.Latitude.replace(/^[+-]/, ''),
                        GPSLongitude: tags.Longitude.replace(/^[+-]/, ''),
                        GPSAltitude: `${tags.RelativeAltitude.replace(/^[+-]/, '')} m Above Sea Level`,
                        GPSAltitudeRef: 'Above Sea Level'
                    };
                    logger.debugTrace('--> Tags : ', gpsXmp, tags, this);
                    try {
                        await exiftool.write(file, gpsXmp);
                        reslove(tags.imgPreview);
                    } catch (err) {
                        reject(err);
                    }
                } catch (err) {
                    reject(err);
                }
            }
        });
    };

    render = props => {
        return (
            <div>
                <Button onClick={this.onFileOpen}>Открыть</Button>)
                <ImageGride></ImageGride>
            </div>
        )
    };
}

export default withStyles(styles, { withTheme: true })(MetadataEditor);
