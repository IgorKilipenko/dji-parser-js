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

import piexif from 'piexifjs';
const exiftool = require('exiftool-vendored').exiftool;
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
                filters: [{ name: 'JPEG images', extensions: ['JPG', 'JPEG', 'DNG'] }],
                properties: ['openFile', 'multiSelections']
            },
            filename => {
                filename && filename.length > 0 ? this.setState({ files: filename }) : this.setState({ fileName: null });
                this.editExif();
            }
        );
    };

    editExif = () => {
        const { files } = this.state;
        if (!files) {
            return;
        }

        for (const file of files) {
            this.loadXmp(file);

            //fs.readFile(file, 'base64', (err, data) => {
            //    if (err) {
            //        logger.error(err, file, this);
            //        return null;
            //    } else {
            //        
            //        const prefix = 'data:image/jpeg;base64,';
            //        const imgBs64 = prefix + data.toString('base64');
            //        const exifObj = piexif.load(imgBs64);
            //        logger.debugTrace('--> Exif', exifObj, this);
            //        let altitude = exifObj.GPS[piexif.GPSIFD.GPSAltitude][0].toString();
            //        altitude = altitude.substring(altitude.length - 3, altitude.length);
            //        exifObj.GPS[piexif.GPSIFD.GPSAltitude][0] = parseInt(altitude);
            //        exifObj.GPS[piexif.GPSIFD.GPSAltitudeRef] = 0;
            //        const exifbytes = piexif.dump(exifObj);
            //        const bs64Exif = piexif.insert(exifbytes, imgBs64).substring(prefix.length);
            //        fs.writeFile(file, bs64Exif, 'base64', err => {
            //            err && logger.error(err, this);
            //        });
            //        //logger.debugTrace('--> GPSAltitude ' + altitude, {altitude}, this);
            //    }
            //});
        }
    };

    loadXmp = async file => {
        let tags = null;
        try {
            tags = await exiftool.read(file);
            const gpsXmp = {
                GPSLatitude: tags.Latitude.replace(/^[+-]/, ''),
                GPSLongitude: tags.Longitude.replace(/^[+-]/, ''),
                GPSAltitude: `${tags.RelativeAltitude.replace(/^[+-]/, '')} m Above Sea Level`,
                GPSAltitudeRef: 'Above Sea Level'
            }
            logger.debugTrace('--> Tags : ', gpsXmp, tags, this)
            try{
                await exiftool.write(file, gpsXmp);
                logger.debugTrace('--> Success exif data : ', gpsXmp, this)
            }catch(err){
                logger.error(err, gpsXmp, this)
            }
        } catch (err) {
            logger.error(err, file, this);
        }
    };

    render = props => {
        return <Button onClick={this.onFileOpen}>Открыть</Button>;
    };
}

export default withStyles(styles, { withTheme: true })(ImagesExif);
