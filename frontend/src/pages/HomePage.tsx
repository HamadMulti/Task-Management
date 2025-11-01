import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Assignment,
  People,
  Folder,
  TrendingUp,
} from '@mui/icons-material';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Assignment />,
      title: 'Task Management',
      description: 'Create, organize, and track tasks with priority levels, due dates, and status updates.',
    },
    {
      icon: <Folder />,
      title: 'Project Organization',
      description: 'Group tasks into projects for better organization and team collaboration.',
    },
    {
      icon: <People />,
      title: 'Team Collaboration',
      description: 'Assign tasks to team members with role-based permissions for admins and standard users.',
    },
    {
      icon: <TrendingUp />,
      title: 'Progress Tracking',
      description: 'Monitor project progress with real-time updates, deadlines, and performance analytics.',
    },
  ];

  const stats = [
    { label: 'Active Projects', value: '500+' },
    { label: 'Tasks Completed', value: '10K+' },
    { label: 'Team Members', value: '2K+' },
    { label: 'Success Rate', value: '95%' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: 8,
          mb: 8,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Welcome to TaskMaster
            </Typography>
            <Typography variant="h5" paragraph sx={{ opacity: 0.9, mb: 4 }}>
              Professional task and project management system. Organize your work, collaborate with your team, 
              and achieve your goals with powerful task management tools.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Start Managing Tasks
              </Button>
              <Button
                component={RouterLink}
                to="/tasks"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                View Tasks
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Why Choose TaskMaster?
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Discover the features that make our platform the perfect place for content creators and readers.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 4,
            }}
          >
            {features.map((feature, index) => (
              <Card key={index} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" component="h3">
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Stats Section */}
        <Box sx={{ mb: 8 }}>
          <Card
            sx={{
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 4,
            }}
          >
            <Typography variant="h4" align="center" gutterBottom>
              Join Our Growing Community
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 4,
                mt: 4,
              }}
            >
              {stats.map((stat, index) => (
                <Box key={index} sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h4" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Join thousands of users who are already sharing their stories and ideas.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}>
            <Chip label="Free to Use" color="primary" variant="outlined" />
            <Chip label="No Ads" color="success" variant="outlined" />
            <Chip label="Open Source" color="secondary" variant="outlined" />
          </Box>
          <Box sx={{ mt: 4 }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{ mr: 2 }}
            >
              Create Account
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              size="large"
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};