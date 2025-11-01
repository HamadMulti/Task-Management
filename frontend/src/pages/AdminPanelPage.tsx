import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Grid,
  Fab,
} from '@mui/material';
import {
  Edit,
  Delete,
  Block,
  CheckCircle,
  Person,
  Article,
  Category,
  AdminPanelSettings,
  Security,
  TrendingUp,
  Group,
  Add,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPanelPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalCategories: 0,
    activeUsers: 0,
  });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDialog, setUserDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'user',
    is_active: true
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await apiService.getUsers();
      setUsers(usersResponse.results || []);
      
      // Fetch posts
      const postsResponse = await apiService.getPosts();
      setPosts(postsResponse.results || []);
      
      // Fetch categories
      const categoriesResponse = await apiService.getCategories();
      setCategories(categoriesResponse || []);
      
      // Calculate stats
      const usersList = usersResponse.results || [];
      const postsList = postsResponse.results || [];
      
      setStats({
        totalUsers: usersList.length,
        totalPosts: postsList.length,
        totalCategories: (categoriesResponse || []).length,
        activeUsers: usersList.filter((u: any) => u.is_active).length,
      });
    } catch (error) {
      setError('Error loading admin data');
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePromoteUser = async (userId: number) => {
    try {
      await apiService.promoteUser(userId);
      setSuccess('User promoted successfully');
      fetchAdminData();
    } catch (error) {
      setError('Error promoting user');
    }
  };

  const handleDemoteUser = async (userId: number) => {
    try {
      await apiService.demoteUser(userId);
      setSuccess('User demoted successfully');
      fetchAdminData();
    } catch (error) {
      setError('Error demoting user');
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await apiService.post(`/auth/users/toggle-status/${userId}/`, { is_active: !currentStatus });
      setSuccess(response.data?.message || `User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchAdminData();
    } catch (error) {
      setError('Error updating user status');
      console.error('Error toggling user status:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUserForm.username || !newUserForm.email || !newUserForm.password ||
          !newUserForm.first_name || !newUserForm.last_name) {
        setError('Please fill in all required fields');
        return;
      }
      await apiService.post('/auth/users/create/', newUserForm);
      setSuccess('User created successfully');
      setUserDialog(false);
      setSelectedUser(null);
      setNewUserForm({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'user',
        is_active: true
      });
      fetchAdminData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setNewUserForm({
      username: user.username,
      email: user.email,
      password: '', // Don't populate password for security
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active
    });
    setUserDialog(true);
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) return;
      
      if (!newUserForm.username || !newUserForm.email ||
          !newUserForm.first_name || !newUserForm.last_name) {
        setError('Please fill in all required fields');
        return;
      }

      // Prepare update data - only include password if it's been changed
      const updateData: any = {
        username: newUserForm.username,
        email: newUserForm.email,
        first_name: newUserForm.first_name,
        last_name: newUserForm.last_name,
        role: newUserForm.role,
        is_active: newUserForm.is_active
      };

      // Only include password if it's been provided
      if (newUserForm.password && newUserForm.password.trim() !== '') {
        updateData.password = newUserForm.password;
      }

      await apiService.put(`/auth/admin/users/${selectedUser.id}/`, updateData);
      setSuccess('User updated successfully');
      setUserDialog(false);
      setSelectedUser(null);
      setNewUserForm({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'user',
        is_active: true
      });
      fetchAdminData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error updating user');
      console.error('Error updating user:', error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await apiService.deletePost(postId.toString());
        setSuccess('Post deleted successfully');
        fetchAdminData();
      } catch (error) {
        setError('Error deleting post');
      }
    }
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
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const UsersTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">User Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setUserDialog(true)}
        >
          Add User
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
                    <Avatar sx={{ mr: 2 }} src={user.avatar}>
                      {user.first_name?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {user.full_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {user.username}
                      </Typography>
                    </Box>
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
                  <IconButton
                    size="small"
                    onClick={() => handleEditUser(user)}
                    title="Edit User"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handlePromoteUser(user.id)}
                    disabled={user.role === 'admin'}
                    title={user.role === 'user' ? 'Promote to Moderator' : 'Already promoted'}
                  >
                    <AdminPanelSettings />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDemoteUser(user.id)}
                    disabled={user.role === 'user' || user.role === 'admin'}
                    title="Demote to User"
                  >
                    <Person />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                    color={user.is_active ? 'error' : 'success'}
                    title={user.is_active ? 'Deactivate User' : 'Activate User'}
                  >
                    {user.is_active ? <Block /> : <CheckCircle />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const PostsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Content Management
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post: any) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {post.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {post.excerpt || post.content?.substring(0, 50) + '...'}
                  </Typography>
                </TableCell>
                <TableCell>{post.author?.full_name}</TableCell>
                <TableCell>
                  <Chip
                    label={post.category?.name || 'Uncategorized'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={post.is_published ? 'Published' : 'Draft'}
                    color={post.is_published ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(post.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton size="small" title="View Post">
                    <Visibility />
                  </IconButton>
                  <IconButton size="small" title="Edit Post">
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeletePost(post.id)}
                    color="error"
                    title="Delete Post"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const CategoriesTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Categories Management</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add Category
        </Button>
      </Box>
      
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={3}>
        {categories.map((category: any) => (
          <Card key={category.id}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {category.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Chip
                    label={`${category.posts_count || 0} posts`}
                    size="small"
                    variant="outlined"
                  />
                  <Box>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
        ))}
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Panel
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage users, content, and system settings
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }} gap={3} mb={4}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Group />}
          color="primary"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<Person />}
          color="success"
        />
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={<Article />}
          color="info"
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon={<Category />}
          color="warning"
        />
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Users" />
            <Tab label="Posts" />
            <Tab label="Categories" />
            <Tab label="Settings" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <UsersTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <PostsTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <CategoriesTab />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            System Settings
          </Typography>
          <Typography variant="body2" color="textSecondary">
            System settings coming soon...
          </Typography>
        </TabPanel>
      </Paper>

      {/* User Creation/Edit Dialog */}
      <Dialog open={userDialog} onClose={() => { setUserDialog(false); setSelectedUser(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="First Name"
                value={newUserForm.first_name}
                onChange={(e) => setNewUserForm({ ...newUserForm, first_name: e.target.value })}
                margin="normal"
                required
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Last Name"
                value={newUserForm.last_name}
                onChange={(e) => setNewUserForm({ ...newUserForm, last_name: e.target.value })}
                margin="normal"
                required
              />
            </Box>
          </Box>
          <TextField
            fullWidth
            label="Username"
            value={newUserForm.username}
            onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newUserForm.email}
            onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newUserForm.password}
            onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
            margin="normal"
            required={!selectedUser}
            helperText={selectedUser ? 'Leave blank to keep current password' : 'Required'}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={newUserForm.role}
              onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="moderator">Moderator</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          {selectedUser && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={newUserForm.is_active ? 'active' : 'inactive'}
                onChange={(e) => setNewUserForm({ ...newUserForm, is_active: e.target.value === 'active' })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setUserDialog(false); setSelectedUser(null); }}>Cancel</Button>
          <Button 
            onClick={selectedUser ? handleUpdateUser : handleCreateUser} 
            variant="contained"
            disabled={!newUserForm.username || !newUserForm.email || (!selectedUser && !newUserForm.password)}
          >
            {selectedUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanelPage;