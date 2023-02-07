import { Box, CircularProgress, createTheme, styled } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

export const drawerWidth = 240;
export const maxCharacters = 60000;
export const chatInputHeightOpen = 7;
export const chatInputHeightClose = 3;

export interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

export const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  backgroundColor: theme.palette.primary.main,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  backgroundColor: theme.palette.primary.main,
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          height: '100%',
          overflow: 'hidden',
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#11152A',
    },
    secondary: {
      main: '#F5F5F5',
    },
  },
});

export const LoaderContainer = styled(Box)(({ theme }) => ({
  height: 500,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
}));

export function DtkLoading() {
  return (
    <LoaderContainer>
      <CircularProgress />
    </LoaderContainer>
  );
}

export const CustomTopMarginSpacer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(5, 1),
  justifyContent: 'flex-end',
  // necessary for content to stay above/below
  ...theme.mixins.toolbar,
}));

export const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  height: '100%',
  flexDirection: 'row',
  padding: theme.spacing(3),
  overflowY: 'auto',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));
