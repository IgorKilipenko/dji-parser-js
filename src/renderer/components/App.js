import React from 'react';
import { MuiThemeProvider, createMuiTheme, withTheme } from '@material-ui/core/styles';
import Tabs from './Tabs';

const theme = createMuiTheme();

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Tabs />
    </MuiThemeProvider>
  );
}

export default App;