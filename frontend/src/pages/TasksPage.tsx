import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Fab,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Assignment,
  Schedule,
  Flag,
  Person,
  Folder,
  CheckCircle,
  AccessTime,
  WarningAmber,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
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
      id={`tasks-tabpanel-${index}`}
      aria-labelledby={`tasks-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'on_hold';
  project: any;
  assigned_to: any;
  created_by: any;
  created_at: string;
  is_overdue: boolean;
  days_until_due: number;
}

interface Project {
  id: number;
  name: string;
  description: string;
  task_count: number;
  created_by: any;
  members: any[];
}

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const initialLoadRef = React.useRef(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  
  // Dialog states
  const [taskDialog, setTaskDialog] = useState(false);
  const [projectDialog, setProjectDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'todo',
    project: '',
    assigned_to: '',
  });
  
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
  });

  const fetchData = useCallback(async () => {
    if (!user) return; // Don't fetch if not authenticated
    
    try {
      setLoading(true);
      const [tasksResponse, projectsResponse, usersResponse] = await Promise.all([
        apiService.get('/tasks/tasks/'),
        apiService.get('/tasks/projects/'),
        apiService.get('/auth/users/')
      ]);
      
      // Handle paginated response structure
      const tasksData = tasksResponse.data?.results || [];
      const projectsData = projectsResponse.data?.results || [];
      const usersData = usersResponse.data?.results || [];
      
      setTasks(tasksData);
      setProjects(projectsData);
      setUsers(usersData);
      
      // Only show success message on initial load
      if (!initialLoadRef.current && (tasksData.length > 0 || projectsData.length > 0)) {
        showInfo(`Loaded ${tasksData.length} tasks and ${projectsData.length} projects`);
        initialLoadRef.current = true;
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        showError('Please log in to access your tasks and projects');
      } else if (err.response?.status === 403) {
        showError('You do not have permission to access this data');
      } else {
        showError('Failed to fetch data. Please try again.');
      }
      console.error('Error fetching data:', err);
      setTasks([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user, showError, showInfo]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleCreateTask = async () => {
    // Validation checks
    if (!taskForm.title.trim()) {
      showError('Task title is required');
      return;
    }
    
    if (!taskForm.description.trim()) {
      showError('Task description is required');
      return;
    }
    
    if (!taskForm.due_date) {
      showError('Due date is required');
      return;
    }
    
    if (!taskForm.project) {
      showError('Please select a project');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      showError('You must be logged in to create tasks');
      return;
    }

    try {
      const taskData = {
        ...taskForm,
        due_date: new Date(taskForm.due_date).toISOString(),
        project: parseInt(taskForm.project),
        assigned_to: taskForm.assigned_to ? parseInt(taskForm.assigned_to) : null,
      };
      
      await apiService.post('/tasks/tasks/', taskData);
      showSuccess('Task created successfully! 🎉');
      setTaskDialog(false);
      setTaskForm({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        status: 'todo',
        project: '',
        assigned_to: '',
      });
      fetchData();
    } catch (err: any) {
      if (err.response?.status === 403) {
        showError('You do not have permission to create tasks');
      } else if (err.response?.status === 401) {
        showError('Please log in to create tasks');
      } else {
        showError('Failed to create task. Please try again.');
      }
      console.error('Error creating task:', err);
    }
  };

  const handleCreateProject = async () => {
    // Validation checks
    if (!projectForm.name.trim()) {
      showError('Project name is required');
      return;
    }
    
    if (!projectForm.description.trim()) {
      showError('Project description is required');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      showError('You must be logged in to create projects');
      return;
    }

    try {
      const response = await apiService.post('/tasks/projects/', projectForm);
      // Update projects state directly with the new project
      setProjects(prev => [...prev, response.data]);
      showSuccess('Project created successfully! 🎉');
      setProjectDialog(false);
      setProjectForm({ name: '', description: '' });
      // No fetchData() call here anymore
    } catch (err: any) {
      if (err.response?.status === 403) {
        showError('You do not have permission to create projects');
      } else if (err.response?.status === 401) {
        showError('Please log in to create projects');
      } else {
        showError('Failed to create project. Please try again.');
      }
      console.error('Error creating project:', err);
    }
  };

  const handleEditTask = async (task: Task) => {
    console.log('Editing task:', task);
    if (!canEditTask(task)) {
      showError('You do not have permission to edit this task');
      return;
    }

    // Set form values from task
    // Format datetime for datetime-local input (YYYY-MM-DDThh:mm)
    const dueDate = new Date(task.due_date);
    const formattedDate = dueDate.toISOString().slice(0, 16);
    
    setTaskForm({
      title: task.title,
      description: task.description,
      due_date: formattedDate,
      priority: task.priority,
      status: task.status,
      project: task.project?.id?.toString() || '',
      assigned_to: task.assigned_to?.id?.toString() || '',
    });
    
    // Set selected task and open dialog
    setSelectedTask(task);
    setTaskDialog(true);
  };

  const handleEditProject = async (project: Project) => {
    console.log('Editing project:', project);
    if (!canEditProject(project)) {
      showError('You do not have permission to edit this project');
      return;
    }

    // Set form values from project
    setProjectForm({
      name: project.name,
      description: project.description,
    });
    setSelectedProject(project);
    setProjectDialog(true);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) {
      showError('No task selected for update');
      return;
    }

    try {
      const taskData = {
        ...taskForm,
        due_date: new Date(taskForm.due_date).toISOString(),
        project: parseInt(taskForm.project),
        assigned_to: taskForm.assigned_to ? parseInt(taskForm.assigned_to) : null,
      };
      
      await apiService.put(`/tasks/tasks/${selectedTask.id}/`, taskData);
      showSuccess('Task updated successfully! 🎉');
      setTaskDialog(false);
      setSelectedTask(null);
      setTaskForm({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        status: 'todo',
        project: '',
        assigned_to: '',
      });
      fetchData();
    } catch (err: any) {
      if (err.response?.status === 403) {
        showError('You do not have permission to update this task');
      } else if (err.response?.status === 401) {
        showError('Please log in to update tasks');
      } else {
        showError('Failed to update task. Please try again.');
      }
      console.error('Error updating task:', err);
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) {
      showError('No project selected for update');
      return;
    }

    try {
      await apiService.put(`/tasks/projects/${selectedProject.id}/`, projectForm);
      showSuccess('Project updated successfully! 🎉');
      setProjectDialog(false);
      setSelectedProject(null);
      setProjectForm({ name: '', description: '' });
      fetchData();
    } catch (err: any) {
      if (err.response?.status === 403) {
        showError('You do not have permission to update this project');
      } else if (err.response?.status === 401) {
        showError('Please log in to update projects');
      } else {
        showError('Failed to update project. Please try again.');
      }
      console.error('Error updating project:', err);
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      status: 'todo',
      project: '',
      assigned_to: '',
    });
    setSelectedTask(null);
  };

  const resetProjectForm = () => {
    setProjectForm({
      name: '',
      description: '',
    });
    setSelectedProject(null);
  };

  const handleCloseTaskDialog = () => {
    setTaskDialog(false);
    resetTaskForm();
  };

  const handleCloseProjectDialog = () => {
    setProjectDialog(false);
    resetProjectForm();
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    
    // Check if task exists and user has permissions
    if (!task) {
      showError('Task not found');
      return;
    }
    
    if (!canEditTask(task)) {
      showError('You do not have permission to update this task');
      return;
    }

    try {
      await apiService.post(`/tasks/tasks/${taskId}/change_status/`, { status: newStatus });
      showSuccess('Task status updated successfully! ✅');
      fetchData();
    } catch (err: any) {
      if (err.response?.status === 403) {
        showError('You do not have permission to update this task');
      } else if (err.response?.status === 401) {
        showError('Please log in to update tasks');
      } else {
        showError('Failed to update task status. Please try again.');
      }
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      showError('Task not found');
      return;
    }
    
    if (!canDeleteTask(task)) {
      showError('You do not have permission to delete this task');
      return;
    }

    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await apiService.delete(`/tasks/tasks/${taskId}/`);
        showSuccess('Task deleted successfully! 🗑️');
        fetchData();
      } catch (err: any) {
        if (err.response?.status === 403) {
          showError('You do not have permission to delete this task');
        } else if (err.response?.status === 401) {
          showError('Please log in to delete tasks');
        } else {
          showError('Failed to delete task. Please try again.');
        }
        console.error('Error deleting task:', err);
      }
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      showError('Project not found');
      return;
    }
    
    if (!canDeleteProject(project)) {
      showError('You do not have permission to delete this project');
      return;
    }

    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      try {
        await apiService.delete(`/tasks/projects/${projectId}/`);
        showSuccess('Project deleted successfully! 🗑️');
        fetchData();
      } catch (err: any) {
        if (err.response?.status === 403) {
          showError('You do not have permission to delete this project');
        } else if (err.response?.status === 401) {
          showError('Please log in to delete projects');
        } else {
          showError('Failed to delete project. Please try again.');
        }
        console.error('Error deleting project:', err);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'todo': return 'info';
      case 'on_hold': return 'default';
      default: return 'default';
    }
  };

  const getFilteredTasks = (taskList: Task[]) => {
    return taskList.filter(task => {
      const statusMatch = statusFilter === 'all' || task.status === statusFilter;
      const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
      const projectMatch = projectFilter === 'all' || task.project?.id?.toString() === projectFilter;
      const assignedMatch = assignedFilter === 'all' || 
        (assignedFilter === 'me' && task.assigned_to?.id === user?.id) ||
        (assignedFilter === 'unassigned' && !task.assigned_to);
      
      return statusMatch && priorityMatch && projectMatch && assignedMatch;
    });
  };

  const canEditTask = (task: Task) => {
    // Admin can edit all tasks
    // Users can edit their own created tasks or tasks assigned to them
    return user?.role === 'admin' || 
           task.created_by?.id === user?.id || 
           task.assigned_to?.id === user?.id;
  };

  const canDeleteTask = (task: Task) => {
    // Admin can delete all tasks
    // Users can delete their own created tasks
    return user?.role === 'admin' || task.created_by?.id === user?.id;
  };

  const canEditProject = (project: Project) => {
    // Only admin and moderator can edit projects
    return user?.role === 'admin' || user?.role === 'moderator';
  };
  
  const canDeleteProject = (project: Project) => {
    // Only admin and moderator can delete projects
    return user?.role === 'admin' || user?.role === 'moderator';
  };

  const canCreateProject = () => {
    // Only admin and moderator can create projects
    return user?.role === 'admin' || user?.role === 'moderator';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Task Management System
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your projects and tasks efficiently
        </Typography>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="My Tasks" icon={<Assignment />} />
          <Tab label="All Tasks" icon={<Schedule />} />
          <Tab label="Projects" icon={<Folder />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">My Assigned Tasks</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                if (!user) {
                  showError('Please log in to create tasks');
                  return;
                }
                if (projects.length === 0) {
                  showWarning('Please create a project first before adding tasks');
                  return;
                }
                setTaskDialog(true);
              }}
              disabled={!user || projects.length === 0}
            >
              {!user ? 'Login Required' : projects.length === 0 ? 'Create Project First' : 'Add Task'}
            </Button>
          </Box>

          {/* Filter Controls */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Project</InputLabel>
              <Select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                label="Project"
              >
                <MenuItem value="all">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

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
                {getFilteredTasks(tasks.filter(task => task.assigned_to?.id === user?.id)).map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{task.title}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{task.project?.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority) as any}
                        size="small"
                        icon={<Flag />}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                        size="small"
                      >
                        <MenuItem value="todo">To Do</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="on_hold">On Hold</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {task.is_overdue && <WarningAmber color="error" sx={{ mr: 1 }} />}
                        <Typography
                          variant="body2"
                          color={task.is_overdue ? 'error' : 'textPrimary'}
                        >
                          {new Date(task.due_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditTask(task)}
                          title="Edit Task"
                        >
                          <Edit />
                        </IconButton>
                        {(user?.role === 'admin' || task.created_by?.id === user?.id) && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTask(task.id)}
                            color="error"
                            title="Delete Task"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">All Tasks</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                if (!user) {
                  showError('Please log in to create tasks');
                  return;
                }
                if (projects.length === 0) {
                  showWarning('Please create a project first before adding tasks');
                  return;
                }
                setTaskDialog(true);
              }}
              disabled={!user || projects.length === 0}
            >
              {!user ? 'Login Required' : projects.length === 0 ? 'Create Project First' : 'Add Task'}
            </Button>
          </Box>

          {/* Filter Controls for All Tasks */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                label="Assigned To"
              >
                <MenuItem value="all">All Assignments</MenuItem>
                <MenuItem value="me">Assigned to Me</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Project</InputLabel>
              <Select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                label="Project"
              >
                <MenuItem value="all">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredTasks(tasks).map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{task.title}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{task.project?.name}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Person sx={{ mr: 1 }} />
                        {task.assigned_to?.username || 'Unassigned'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority) as any}
                        size="small"
                        icon={<Flag />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status.replace('_', ' ')}
                        color={getStatusColor(task.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {task.is_overdue && <WarningAmber color="error" sx={{ mr: 1 }} />}
                        <Typography
                          variant="body2"
                          color={task.is_overdue ? 'error' : 'textPrimary'}
                        >
                          {new Date(task.due_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditTask(task)}
                          title="Edit Task"
                        >
                          <Edit />
                        </IconButton>
                        {(user?.role === 'admin' || task.created_by?.id === user?.id) && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTask(task.id)}
                            color="error"
                            title="Delete Task"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Projects</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                if (!user) {
                  showError('Please log in to create projects');
                  return;
                }
                if (!canCreateProject()) {
                  showError('Only admins and moderators can create projects');
                  return;
                }
                setProjectDialog(true);
              }}
              disabled={!user || !canCreateProject()}
            >
              {!user ? 'Login Required' : !canCreateProject() ? 'Admin/Moderator Only' : 'Add Project'}
            </Button>
          </Box>

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={3}>
            {projects.map((project) => (
              <Card key={project.id}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {project.description}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Chip
                        label={`${project.task_count} tasks`}
                        size="small"
                        variant="outlined"
                        icon={<Assignment />}
                      />
                      <Box>
                        {canEditProject(project) && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditProject(project)}
                            title="Edit Project"
                          >
                            <Edit />
                          </IconButton>
                        )}
                        {canDeleteProject(project) && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteProject(project.id)}
                            color="error"
                            title="Delete Project"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
            ))}
          </Box>
        </TabPanel>
      </Paper>

      {/* Task Creation Dialog */}
      <Dialog open={taskDialog} onClose={handleCloseTaskDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="datetime-local"
            value={taskForm.due_date}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              const now = new Date();
              if (selectedDate < now) {
                showError('Due date cannot be in the past');
                return;
              }
              setTaskForm({ ...taskForm, due_date: e.target.value });
            }}
            margin="normal"
            InputProps={{
              inputProps: {
                min: new Date().toISOString().slice(0, 16)
              }
            }}
            InputLabelProps={{ shrink: true }}
            required
            error={taskForm.due_date === '' || new Date(taskForm.due_date) < new Date()}
            helperText={taskForm.due_date === '' ? 'Due date is required' : 
              new Date(taskForm.due_date) < new Date() ? 'Due date cannot be in the past' : ''}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Project</InputLabel>
            <Select
              value={taskForm.project}
              onChange={(e) => setTaskForm({ ...taskForm, project: e.target.value })}
              label="Project"
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign To</InputLabel>
            <Select
              value={taskForm.assigned_to}
              onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
              label="Assign To"
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.full_name || u.username} ({u.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>Cancel</Button>
          <Button 
            onClick={selectedTask ? handleUpdateTask : handleCreateTask} 
            variant="contained"
            color={selectedTask ? "primary" : "success"}
            disabled={!taskForm.title || !taskForm.description || !taskForm.due_date || !taskForm.project}
          >
            {selectedTask ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Creation Dialog */}
      <Dialog open={projectDialog} onClose={handleCloseProjectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Project Name"
            value={projectForm.name}
            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={projectForm.description}
            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProjectDialog}>Cancel</Button>
          <Button 
            onClick={selectedProject ? handleUpdateProject : handleCreateProject} 
            variant="contained"
            color={selectedProject ? "primary" : "success"}
            disabled={!projectForm.name || !projectForm.description}
          >
            {selectedProject ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};