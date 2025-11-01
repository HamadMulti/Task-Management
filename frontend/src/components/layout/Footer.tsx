import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  GitHub,
  Twitter,
  LinkedIn,
  Email,
} from '@mui/icons-material';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ];

  const socialLinks = [
    { icon: GitHub, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: LinkedIn, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Email, href: 'mailto:contact@example.com', label: 'Email' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Typography variant="h6" gutterBottom>
              TaskMaster
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              A modern web application built with Django and React, featuring
              user authentication, content management, and a beautiful Material-UI interface.
            </Typography>
            <Box sx={{ mt: 2 }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  aria-label={social.label}
                >
                  <social.icon />
                </IconButton>
              ))}
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  color="text.secondary"
                  variant="body2"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography variant="h6" gutterBottom>
              Features
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                User Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Content Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categories & Tags
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comments & Likes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Responsive Design
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} TaskMaster. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Built with ❤️ using Django & React
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};