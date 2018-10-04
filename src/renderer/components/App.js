import React from 'react';
import { MuiThemeProvider, createMuiTheme, withTheme } from '@material-ui/core/styles';
import Root from './Root';

const theme = createMuiTheme();

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Root />
    </MuiThemeProvider>
  );
}

export default App;