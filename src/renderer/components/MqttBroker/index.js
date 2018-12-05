import React from 'react';
import PropTypes from 'prop-types';

import { withStyles, withTheme } from '@material-ui/core/styles';

import mosca from 'mosca';

const styles = theme => ({});

const ascoltatore = {
    //using ascoltatore
    type: 'mongo',
    url: 'mongodb://localhost:27017/mqtt',
    pubsubCollection: 'ascoltatori',
    mongo: {}
};
const settings = {
    port: 1883,
    backend: ascoltatore
};
const server = new mosca.Server(settings);
server.on('clientConnected', client => {
    console.log('client connected', client.id);
});
server.on('published', (packet, client) => {
    console.log('Published', packet.payload);
});

const setup = () => {
    console.log('Mosca server is up and running');
};
server.on('ready', setup);
class MqttBroker extends React.Component {
    render() {
        return <div>MQTT</div>;
    }
}

export default withStyles(styles)(MqttBroker);
