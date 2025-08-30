// Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  ListSubheader,
  IconButton,
  useTheme,
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const drawerWidth = 240;

const Sidebar = ({ isToggled, handleToggle }) => {
  const theme = useTheme();

  const navLinkStyle = {
    textDecoration: 'none',
    color: 'inherit',
    width: '100%',
  };

  const activeLinkStyle = {
    backgroundColor: 'rgba(25, 118, 210, 0.16)',
  };

  const iconColor = 'rgba(255, 255, 255, 0.85)';

  return (
    <Drawer
      variant="permanent"
      open={isToggled}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          borderRight: 'none',
          backgroundColor: '#0c1e35',
          color: '#e0e0e0',
        },
        ...(!isToggled && {
          '& .MuiDrawer-paper': {
            width: theme.spacing(7),
            backgroundColor: '#0c1e35',
            color: '#e0e0e0',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          },
        }),
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: [1],
          backgroundColor: '#08172b',
        }}
      >
        {isToggled && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, whiteSpace: 'nowrap' }}>
            <img src="/favicon.ico" alt="Logo" style={{ width: 32, height: 32 }} />
            <Typography variant="h6" sx={{ ml: 2, color: 'white' }}>
              Financeiro
            </Typography>
          </Box>
        )}
        <IconButton onClick={handleToggle} sx={{ color: 'white' }}>
          {isToggled ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        <ListItem disablePadding>
          <NavLink to="/home" style={navLinkStyle}>
            {({ isActive }) => (
              <ListItemButton sx={isActive ? activeLinkStyle : {}}>
                <ListItemIcon sx={{ color: iconColor, minWidth: 'auto', mr: isToggled ? 3 : 'auto' }}>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboards" sx={{ opacity: isToggled ? 1 : 0 }} />
              </ListItemButton>
            )}
          </NavLink>
        </ListItem>
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List
        subheader={
          <ListSubheader
            component="div"
            sx={{
              backgroundColor: 'transparent',
              color: '#8a99af',
              display: isToggled ? 'block' : 'none',
            }}
          >
            Cadastros
          </ListSubheader>
        }
      >
        {[
          { text: 'Pessoas', to: '/Pessoas', icon: <PeopleIcon /> },
          { text: 'Plano de Contas', to: '/Planocontas', icon: <DescriptionIcon /> },
          { text: 'Contas', to: '/Contas', icon: <AccountBalanceIcon /> },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <NavLink to={item.to} style={navLinkStyle}>
              {({ isActive }) => (
                <ListItemButton sx={isActive ? activeLinkStyle : {}}>
                  <ListItemIcon sx={{ color: iconColor, minWidth: 'auto', mr: isToggled ? 3 : 'auto' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: isToggled ? 1 : 0 }} />
                </ListItemButton>
              )}
            </NavLink>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List
        subheader={
          <ListSubheader
            component="div"
            sx={{
              backgroundColor: 'transparent',
              color: '#8a99af',
              display: isToggled ? 'block' : 'none',
            }}
          >
            Operações
          </ListSubheader>
        }
      >
        <ListItem disablePadding>
          <NavLink to="/Lancamentos" style={navLinkStyle}>
            {({ isActive }) => (
              <ListItemButton sx={isActive ? activeLinkStyle : {}}>
                <ListItemIcon sx={{ color: iconColor, minWidth: 'auto', mr: isToggled ? 3 : 'auto' }}>
                  <ReceiptLongIcon />
                </ListItemIcon>
                <ListItemText primary="Lançamento" sx={{ opacity: isToggled ? 1 : 0 }} />
              </ListItemButton>
            )}
          </NavLink>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;