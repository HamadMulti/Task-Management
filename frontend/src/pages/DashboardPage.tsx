import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Favorite,
  Add,
  Edit,
  Delete,
  Visibility,
  Comment,
  AdminPanelSettings,
  Assignment,
  CheckCircle,
  Warning,
  Folder,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Link } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    myTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalProjects: 0,
    myProjects: 0,
    myPosts: 0,
    publishedPosts: 0,
    totalUsers: 0,
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's tasks and projects
      const [tasksResponse, projectsResponse, postsResponse] = await Promise.all([
        apiService.get('/tasks/tasks/'),
        apiService.get('/tasks/projects/'),
        apiService.get('/posts/')
      ]);
      
      const allTasks = tasksResponse.data?.results || tasksResponse.data || [];
      const allProjects = projectsResponse.data?.results || projectsResponse.data || [];
      const allPosts = postsResponse.data?.results || postsResponse.data || [];
      
      const userTasks = allTasks.filter((task: any) => task.assigned_to?.id === user?.id);
      const userProjects = allProjects.filter((project: any) => 
        project.created_by?.id === user?.id || 
        project.members?.some((member: any) => member.id === user?.id)
      );
      const userPosts = allPosts.filter((post: any) => post.author?.id === user?.id);
      
      setTasks(allTasks);
      setProjects(allProjects);
      setPosts(userPosts);
      
      // Calculate task statistics
      const completedTasks = userTasks.filter((task: any) => task.status === 'completed');
      const overdueTasks = userTasks.filter((task: any) => task.is_overdue);
      const publishedPosts = userPosts.filter((post: any) => post.is_published);
      
      setStats({
        totalTasks: allTasks.length,
        myTasks: userTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        totalProjects: allProjects.length,
        myProjects: userProjects.length,
        myPosts: userPosts.length,
        publishedPosts: publishedPosts.length,
        totalUsers: 0, // Will be updated if user is admin
      });

      // Fetch users for admin
      if (user?.role === 'admin') {
        try {
          const usersResponse = await apiService.getUsers();
          const allUsers = usersResponse.results || [];
          setUsers(allUsers);
          
          // Update stats with total users
          setStats(prevStats => ({
            ...prevStats,
            totalUsers: allUsers.length,
          }));
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const StatCard = ({ title, value, icon, color = 'primary' }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const AllTasksTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          All Tasks ({tasks.length})
        </Typography>
        <Button
          component={Link}
          to="/tasks"
          variant="contained"
          startIcon={<Add />}
        >
          Create New Task
        </Button>
      </Box>
      
      {tasks.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.slice(0, 20).map((task: any) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{task.title}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {task.description?.substring(0, 50)}{task.description?.length > 50 ? '...' : ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.875rem' }}>
                        {task.assigned_to?.first_name?.[0] || '?'}
                      </Avatar>
                      {task.assigned_to?.full_name || 'Unassigned'}
                    </Box>
                  </TableCell>
                  <TableCell>{task.project?.name || 'No Project'}</TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={task.priority === 'urgent' ? 'error' : task.priority === 'high' ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status?.replace('_', ' ')}
                      size="small"
                      color={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={task.is_overdue ? 'error' : 'textPrimary'}
                    >
                      {new Date(task.due_date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" component={Link} to="/tasks">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" component={Link} to="/tasks">
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No tasks in the system yet
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Create the first task to get started
          </Typography>
          <Button
            component={Link}
            to="/tasks"
            variant="contained"
            startIcon={<Add />}
            sx={{ mt: 2 }}
          >
            Create Task
          </Button>
        </Box>
      )}
    </Box>
  );

  const AllProjectsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          All Projects ({projects.length})
        </Typography>
        <Button
          component={Link}
          to="/tasks"
          variant="contained"
          startIcon={<Add />}
        >
          Create New Project
        </Button>
      </Box>
      
      {projects.length > 0 ? (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={3}>
          {projects.map((project: any) => (
            <Card key={project.id}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  {project.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {project.description?.substring(0, 100)}{project.description?.length > 100 ? '...' : ''}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={2} mb={2} flexWrap="wrap">
                  <Chip
                    label={`${project.task_count || 0} tasks`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    avatar={<Avatar sx={{ width: 20, height: 20 }}>{project.created_by?.first_name?.[0]}</Avatar>}
                    label={project.created_by?.full_name || 'Unknown'}
                    size="small"
                    color="primary"
                  />
                  {project.members && project.members.length > 0 && (
                    <Chip
                      label={`${project.members.length} member${project.members.length > 1 ? 's' : ''}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </Typography>
                  <Box>
                    <IconButton size="small" component={Link} to="/tasks">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" component={Link} to="/tasks">
                      <Edit />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No projects in the system yet
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Create the first project to organize tasks
          </Typography>
          <Button
            component={Link}
            to="/tasks"
            variant="contained"
            startIcon={<Add />}
            sx={{ mt: 2 }}
          >
            Create Project
          </Button>
        </Box>
      )}
    </Box>
  );

  const UserManagementTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          User Management ({users.length} users)
        </Typography>
        <Button
          component={Link}
          to="/admin"
          variant="contained"
          color="primary"
        >
          Go to Admin Panel
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2 }}>
                      {user.first_name?.[0]}
                    </Avatar>
                    {user.full_name}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role_display || user.role}
                    color={
                      user.role === 'admin' ? 'error' :
                      user.role === 'moderator' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.is_active ? 'Active' : 'Inactive'}
                    color={user.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.date_created).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small">
                    {user.role === 'user' ? <AdminPanelSettings /> : <Person />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const MyTasksTab = () => {
    const myTasks = tasks.filter((task: any) => task.assigned_to?.id === user?.id);
    
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            My Tasks ({myTasks.length})
          </Typography>
          <Button
            component={Link}
            to="/tasks"
            variant="contained"
            startIcon={<Add />}
          >
            Create New Task
          </Button>
        </Box>
        
        {myTasks.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myTasks.slice(0, 10).map((task: any) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{task.title}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {task.description?.substring(0, 50)}{task.description?.length > 50 ? '...' : ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{task.project?.name || 'No Project'}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        size="small"
                        color={task.priority === 'urgent' ? 'error' : task.priority === 'high' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status?.replace('_', ' ')}
                        size="small"
                        color={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={task.is_overdue ? 'error' : 'textPrimary'}
                      >
                        {new Date(task.due_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" component={Link} to="/tasks">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" component={Link} to="/tasks">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No tasks assigned yet
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Go to Tasks page to create or get assigned to tasks
            </Typography>
            <Button
              component={Link}
              to="/tasks"
              variant="contained"
              startIcon={<Add />}
              sx={{ mt: 2 }}
            >
              Go to Tasks
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const MyProjectsTab = () => {
    const myProjects = projects.filter((project: any) => 
      project.created_by?.id === user?.id || 
      project.members?.some((member: any) => member.id === user?.id)
    );
    
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            My Projects ({myProjects.length})
          </Typography>
          <Button
            component={Link}
            to="/tasks"
            variant="contained"
            startIcon={<Add />}
          >
            Create New Project
          </Button>
        </Box>
        
        {myProjects.length > 0 ? (
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={3}>
            {myProjects.map((project: any) => (
              <Card key={project.id}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {project.description?.substring(0, 100)}{project.description?.length > 100 ? '...' : ''}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={2} mb={2}>
                    <Chip
                      label={`${project.task_count || 0} tasks`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={project.created_by?.id === user?.id ? 'Owner' : 'Member'}
                      size="small"
                      color={project.created_by?.id === user?.id ? 'primary' : 'default'}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="caption" color="textSecondary">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </Typography>
                    <Box>
                      <IconButton size="small" component={Link} to="/tasks">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" component={Link} to="/tasks">
                        <Edit />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No projects yet
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Create or join projects to see them here
            </Typography>
            <Button
              component={Link}
              to="/tasks"
              variant="contained"
              startIcon={<Add />}
              sx={{ mt: 2 }}
            >
              Go to Projects
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  const MyPostsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          My Posts ({posts.length})
        </Typography>
        <Button
          component={Link}
          to="/create-post"
          variant="contained"
          startIcon={<Add />}
        >
          Create New Post
        </Button>
      </Box>
      
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={3}>
        {posts.map((post: any) => (
          <Card key={post.id}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {post.excerpt || post.content?.substring(0, 100) + '...'}
                </Typography>
                <Box display="flex" alignItems="center" mt={2} mb={2}>
                  <Chip
                    label={post.category?.name || 'Uncategorized'}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={post.is_published ? 'Published' : 'Draft'}
                    size="small"
                    color={post.is_published ? 'success' : 'default'}
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <Favorite fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {post.likes_count || 0}
                    </Typography>
                    <Comment fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {post.comments_count || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(post.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<Visibility />}>
                  View
                </Button>
                <Button size="small" startIcon={<Edit />}>
                  Edit
                </Button>
                <Button size="small" startIcon={<Delete />} color="error">
                  Delete
                </Button>
              </CardActions>
            </Card>
        ))}
      </Box>
      
      {posts.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No posts yet
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Start creating content to see your posts here
          </Typography>
          <Button
            component={Link}
            to="/create-post"
            variant="contained"
            startIcon={<Add />}
            sx={{ mt: 2 }}
          >
            Create Your First Post
          </Button>
        </Box>
      )}
    </Box>
  );

  if (!user) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Please log in to access your dashboard.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Welcome back, {user.first_name}! Here's your overview.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr', lg: user?.role === 'admin' ? '1fr 1fr 1fr 1fr 1fr 1fr 1fr' : '1fr 1fr 1fr 1fr 1fr 1fr' }} gap={3} mb={4}>
        <StatCard
          title="My Tasks"
          value={stats.myTasks}
          icon={<Assignment />}
          color="primary"
        />
        <StatCard
          title="Completed"
          value={stats.completedTasks}
          icon={<CheckCircle />}
          color="success"
        />
        <StatCard
          title="Overdue"
          value={stats.overdueTasks}
          icon={<Warning />}
          color="error"
        />
        <StatCard
          title="My Projects"
          value={stats.myProjects}
          icon={<Folder />}
          color="info"
        />
        <StatCard
          title="My Posts"
          value={stats.myPosts}
          icon={<Edit />}
          color="secondary"
        />
        <StatCard
          title="Published"
          value={stats.publishedPosts}
          icon={<Visibility />}
          color="success"
        />
        {user?.role === 'admin' && (
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Person />}
            color="error"
          />
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="My Tasks" />
            <Tab label="My Projects" />
            <Tab label="My Posts" />
            {user.role === 'admin' && <Tab label="All Tasks" />}
            {user.role === 'admin' && <Tab label="All Projects" />}
            {user.role === 'admin' && <Tab label="User Management" />}
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <MyTasksTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <MyProjectsTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <MyPostsTab />
        </TabPanel>
        
        {user.role === 'admin' && (
          <TabPanel value={tabValue} index={3}>
            <AllTasksTab />
          </TabPanel>
        )}
        
        {user.role === 'admin' && (
          <TabPanel value={tabValue} index={4}>
            <AllProjectsTab />
          </TabPanel>
        )}
        
        {user.role === 'admin' && (
          <TabPanel value={tabValue} index={5}>
            <UserManagementTab />
          </TabPanel>
        )}
      </Paper>
    </Container>
  );
};