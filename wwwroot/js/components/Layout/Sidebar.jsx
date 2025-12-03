import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
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
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material'

import HomeIcon from '@mui/icons-material/Home'
import PeopleIcon from '@mui/icons-material/People'
import DescriptionIcon from '@mui/icons-material/Description'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SchoolIcon from '@mui/icons-material/School'
import { ThemeSwitcher } from './ThemeSwitcher'

const drawerWidth = 240

function decodeHtml(html) {
  if (!html) return ''
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

const Sidebar = ({
  isToggled,
  handleToggle,
  userName,
  handleLogout,
  handleStartTour,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
}) => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState(null)
  const isMenuOpen = Boolean(anchorEl)

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const decodedUserName = decodeHtml(userName)

  const navLinkStyle = {
    textDecoration: 'none',
    color: 'inherit',
    width: '100%',
  }

  const activeLinkStyle = {
    backgroundColor: 'rgba(25, 118, 210, 0.16)',
  }

  const iconColor = 'rgba(255, 255, 255, 0.85)'

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 1, sm: 2 },
          backgroundColor: theme.palette.background.default,
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        {isToggled && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: 1,
              whiteSpace: 'nowrap',
            }}
          >
            <img
              src="/favicon.ico"
              alt="Logo"
              style={{ width: 32, height: 32 }}
            />
            <Typography variant="h6" sx={{ ml: 2, color: 'inherit', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Financeiro
            </Typography>
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <ThemeSwitcher />
      </Toolbar>
      <Divider />
      <List sx={{ px: { xs: 0.5, sm: 1 } }}>
        <ListItem disablePadding>
          <NavLink to="/home" style={navLinkStyle} onClick={isMobile ? onMobileClose : undefined}>
            {({ isActive }) => (
              <ListItemButton
                id="tour-sidebar-dashboard"
                sx={{
                  ...(isActive ? activeLinkStyle : {}),
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 1, sm: 2 },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 'auto',
                    mr: isToggled ? { xs: 2, sm: 3 } : 'auto',
                  }}
                >
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Dashboards"
                  sx={{ opacity: isToggled ? 1 : 0 }}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                />
              </ListItemButton>
            )}
          </NavLink>
        </ListItem>
        <ListItem disablePadding>
          <NavLink to="/relatorios" style={navLinkStyle} onClick={isMobile ? onMobileClose : undefined}>
            {({ isActive }) => (
              <ListItemButton
                id="tour-sidebar-relatorios"
                sx={{
                  ...(isActive ? activeLinkStyle : {}),
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 1, sm: 2 },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 'auto',
                    mr: isToggled ? { xs: 2, sm: 3 } : 'auto',
                  }}
                >
                  <AssessmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Relatórios"
                  sx={{ opacity: isToggled ? 1 : 0 }}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                />
              </ListItemButton>
            )}
          </NavLink>
        </ListItem>
      </List>
      <Divider />
      <List
        sx={{ px: { xs: 0.5, sm: 1 } }}
        subheader={
          <ListSubheader
            component="div"
            id="tour-sidebar-cadastros"
            sx={{
              backgroundColor: 'transparent',
              color: 'text.secondary',
              display: isToggled ? 'block' : 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
            }}
          >
            Cadastros
          </ListSubheader>
        }
      >
        {[
          { text: 'Pessoas', to: '/Pessoas', icon: <PeopleIcon /> },
          {
            text: 'Plano de Contas',
            to: '/Planocontas',
            icon: <DescriptionIcon />,
          },
          { text: 'Contas', to: '/Contas', icon: <AccountBalanceIcon /> },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <NavLink to={item.to} style={navLinkStyle} onClick={isMobile ? onMobileClose : undefined}>
              {({ isActive }) => (
                <ListItemButton
                  id={
                    item.text === 'Pessoas' ? 'tour-sidebar-pessoas' : undefined
                  }
                  sx={{
                    ...(isActive ? activeLinkStyle : {}),
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 1, sm: 2 },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: 'auto',
                      mr: isToggled ? { xs: 2, sm: 3 } : 'auto',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: isToggled ? 1 : 0 }}
                    primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  />
                </ListItemButton>
              )}
            </NavLink>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List
        sx={{ px: { xs: 0.5, sm: 1 } }}
        subheader={
          <ListSubheader
            component="div"
            id="tour-sidebar-operacoes"
            sx={{
              backgroundColor: 'transparent',
              color: 'text.secondary',
              display: isToggled ? 'block' : 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
            }}
          >
            Operações
          </ListSubheader>
        }
      >
        <ListItem disablePadding>
          <NavLink to="/Lancamentos" style={navLinkStyle} onClick={isMobile ? onMobileClose : undefined}>
            {({ isActive }) => (
              <ListItemButton
                id="tour-sidebar-lancamentos"
                sx={{
                  ...(isActive ? activeLinkStyle : {}),
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 1, sm: 2 },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 'auto',
                    mr: isToggled ? { xs: 2, sm: 3 } : 'auto',
                  }}
                >
                  <ReceiptLongIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Lançamento"
                  sx={{ opacity: isToggled ? 1 : 0 }}
                  primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                />
              </ListItemButton>
            )}
          </NavLink>
        </ListItem>
      </List>
      <Divider />
      <List
        sx={{ px: { xs: 0.5, sm: 1 } }}
        subheader={
          <ListSubheader
            component="div"
            sx={{
              backgroundColor: 'transparent',
              color: 'text.secondary',
              display: isToggled ? 'block' : 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
            }}
          >
            Orientações
          </ListSubheader>
        }
      >
        {[
          {
            text: 'Tutorial',
            to: '/orientacoes/tutorial',
            icon: <SchoolIcon />,
          },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <NavLink to={item.to} style={navLinkStyle} onClick={isMobile ? onMobileClose : undefined}>
              {({ isActive }) => (
                <ListItemButton sx={{
                  ...(isActive ? activeLinkStyle : {}),
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 1, sm: 2 },
                }}>
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: 'auto',
                      mr: isToggled ? { xs: 2, sm: 3 } : 'auto',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: isToggled ? 1 : 0 }}
                    primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  />
                </ListItemButton>
              )}
            </NavLink>
          </ListItem>
        ))}
      </List>
      {!isMobile && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 1,
          }}
        >
          <IconButton onClick={handleToggle} sx={{ color: 'inherit' }}>
            {isToggled ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
      )}
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <ListItemButton
          onClick={handleProfileMenuOpen}
          sx={{
            py: { xs: 1.5, sm: 2 },
            px: isToggled ? { xs: 1, sm: 2 } : 'auto',
            justifyContent: 'center',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isToggled ? { xs: 1.5, sm: 2 } : 'auto',
              justifyContent: 'center',
            }}
          >
            <Avatar
              sx={{
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                bgcolor: theme.palette.primary.main,
                color: 'white',
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {decodedUserName ? decodedUserName.charAt(0) : ''}
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={decodedUserName}
            sx={{ opacity: isToggled ? 1 : 0, color: 'inherit' }}
            primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          />
        </ListItemButton>
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose()
            }}
          >
            <ListItemIcon>
              <SchoolIcon fontSize="small" />
            </ListItemIcon>
            Fazer Tour - Em desenvolvimento
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose()
              handleLogout()
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Sair
          </MenuItem>
        </Menu>
      </Box>
    </>
  )

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={handleToggle}
          sx={{
            position: 'fixed',
            top: 8,
            left: 8,
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.background.paper,
            boxShadow: 2,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : isToggled}
        onClose={isMobile ? onMobileClose : undefined}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: isMobile
              ? theme.transitions.create('transform', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                })
              : theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            overflowX: 'hidden',
            borderRight: 'none',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
          ...(!isToggled && !isMobile && {
            '& .MuiDrawer-paper': {
              width: theme.spacing(7),
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            },
          }),
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  )
}

export default Sidebar
