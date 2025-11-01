import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { Save, Preview, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Post, Category } from '../types';

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [] as string[],
    is_published: false,
    is_featured: false,
    status: 'draft' as 'draft' | 'published' | 'archived',
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit && id) {
      fetchPost(parseInt(id));
    }
  }, [isEdit, id]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      // Ensure categories is always an array
      setCategories(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const fetchPost = async (postId: number) => {
    try {
      setLoading(true);
      const post = await apiService.getPost(postId.toString());
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        category: post.category?.id?.toString() || '',
        tags: post.tags?.map((tag: any) => tag.name) || [],
        is_published: post.is_published,
        is_featured: post.is_featured || false,
        status: post.status,
      });
    } catch (error) {
      setError('Error loading post');
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string) => (event: any) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagsChange = (event: any, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim(),
        category: formData.category ? parseInt(formData.category) : null,
        tags: formData.tags,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        status: formData.status,
        allow_comments: true,
      };

      if (isEdit && id) {
        await apiService.updatePost(id, postData);
        setSuccess('Post updated successfully!');
      } else {
        await apiService.createPost(postData);
        setSuccess('Post created successfully!');
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error saving post');
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Store current form data in sessionStorage for preview
    sessionStorage.setItem('previewPost', JSON.stringify(formData));
    window.open('/preview-post', '_blank');
  };

  if (!user) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Please log in to create posts.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box mb={3}>
        <Button
          component={Link}
          to="/dashboard"
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEdit ? 'Edit Post' : 'Create New Post'}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Post Title"
              value={formData.title}
              onChange={handleInputChange('title')}
              required
              variant="outlined"
              placeholder="Enter an engaging title for your post"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Excerpt (Optional)"
              value={formData.excerpt}
              onChange={handleInputChange('excerpt')}
              variant="outlined"
              multiline
              rows={2}
              placeholder="Brief summary of your post (will be auto-generated if left empty)"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={handleInputChange('content')}
              required
              variant="outlined"
              multiline
              rows={12}
              placeholder="Write your post content here. You can use markdown formatting."
            />
          </Box>

          <Box display="flex" gap={2} mb={3}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleInputChange('category')}
                label="Category"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleInputChange('status')}
                label="Status"
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.tags}
              onChange={handleTagsChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={index}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags and press Enter"
                  helperText="Add relevant tags to help people discover your post"
                />
              )}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_published}
                  onChange={handleInputChange('is_published')}
                />
              }
              label="Publish immediately"
            />
            
            {(user.role === 'admin' || user.role === 'moderator') && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_featured}
                    onChange={handleInputChange('is_featured')}
                  />
                }
                label="Featured post"
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              type="button"
              variant="outlined"
              startIcon={<Preview />}
              onClick={handlePreview}
              disabled={!formData.title || !formData.content}
            >
              Preview
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                isEdit ? 'Update Post' : 'Create Post'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};