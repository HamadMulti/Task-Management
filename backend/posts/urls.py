from django.urls import path
from . import views

app_name = 'posts'

urlpatterns = [
    # Posts
    path('', views.PostListView.as_view(), name='list'),
    path('stats/', views.post_stats, name='stats'),
    path('user/<int:user_id>/', views.UserPostsView.as_view(), name='user_posts'),
    path('bookmarks/', views.user_bookmarks, name='bookmarks'),
    path('<slug:slug>/', views.PostDetailView.as_view(), name='detail'),
    
    # Post interactions
    path('<slug:post_slug>/like/', views.toggle_like, name='toggle_like'),
    path('<slug:post_slug>/bookmark/', views.toggle_bookmark, name='toggle_bookmark'),
    path('<slug:post_slug>/comments/', views.PostCommentsView.as_view(), name='comments'),
    
    # Tags
    path('tags/', views.TagListView.as_view(), name='tags'),
]