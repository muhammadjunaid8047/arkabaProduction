'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageCircle, Send, Paperclip, ImageIcon, File, Clock, User, UserX, ChevronUp, Menu, X } from 'lucide-react';
import usePusher from '@/app/hooks/usePusher';

export default function ChatRoom() {
  // Declare all hooks first
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [anonymous, setAnonymous] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define functions before they are used
  const loadMessages = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingMessages(true);
      }
      const response = await fetch(`/api/message?page=${pageNum}&limit=20`);
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      const data = await response.json();
      if (append) {
        setMessages((prev) => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages);
      }
      setPagination(data.pagination);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage, true);
    }
  };

  const sendMessage = async () => {
    if (!message && !file) return;
    setIsLoading(true);
    let fileUrl = null;
    let fileData = null;
    
    if (file) {
      try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
        
        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
        }
        
      const data = await res.json();
        console.log('Upload response:', data); // Debug log
        
        if (data.success) {
      fileUrl = data.fileUrl;
          fileData = {
            fileSize: data.size,
            fileName: data.originalName,
            fileType: data.type
          };
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } catch (error) {
        console.error('File upload error:', error);
        alert('File upload failed: ' + error.message);
        setIsLoading(false);
        return;
      }
    }

    try {
      const messageData = {
    text: message,
    fileUrl,
        fileSize: fileData?.fileSize || null,
        fileName: fileData?.fileName || null,
        fileType: fileData?.fileType || null,
    anonymous,
    userName: anonymous ? 'Anonymous' : session.user.name,
    fullName: session.user.name,
    email: session.user.email,
      };
      
      console.log('Sending message with data:', messageData); // Debug log
      
      const messageRes = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (!messageRes.ok) {
        throw new Error(`Message creation failed: ${messageRes.status} ${messageRes.statusText}`);
      }

      const messageResult = await messageRes.json();
      console.log('Message creation response:', messageResult); // Debug log
      
      // Reload messages to show the new message
      await loadMessages();
      
    } catch (error) {
      console.error('Message creation error:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
    setMessage('');
    setFile(null);
    setAnonymous(false);
    setIsLoading(false);
    }
  };

  const postComment = async (messageId) => {
    const commentText = commentInputs[messageId];
    if (!commentText) return;
    await fetch('/api/comment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messageId,
    text: commentText,
    anonymous,
    userName: anonymous ? 'Anonymous' : session.user.name,
    fullName: session.user.name,
    email: session.user.email,
  }),
});

    setCommentInputs((prev) => ({ ...prev, [messageId]: '' }));
  };

  const toggleComments = (messageId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const getFileIcon = (fileUrl) => {
    const isImage = /\.(jpe?g|png|gif|webp|bmp)$/i.test(fileUrl || '');
    return isImage ? <ImageIcon className="h-4 w-4" /> : <File className="h-4 w-4" />;
  };

  const getUserInitials = (userName) => {
    return userName === 'Anonymous' ? 'A' : userName.charAt(0).toUpperCase();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (fileUrl) => {
    const ext = fileUrl?.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const docExts = ['pdf', 'doc', 'docx', 'txt'];
    const spreadsheetExts = ['csv', 'xls', 'xlsx'];
    
    if (imageExts.includes(ext)) return 'image';
    if (docExts.includes(ext)) return 'document';
    if (spreadsheetExts.includes(ext)) return 'spreadsheet';
    return 'file';
  };

  // Real-time message updates
  usePusher('chat-channel', 'new-message', (data) => {
    setMessages((prev) => [...prev, data]);
  });

  usePusher('chat-channel', 'new-comment', (comment) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === comment.messageId ? { ...msg, comments: [...(msg.comments || []), comment] } : msg
      )
    );
  });

  // Initial load
  useEffect(() => {
    loadMessages();
  }, []);

  // Check authentication status after all hooks
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="text-lg">Loading messages...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <p>Access Denied</p>;
  }

  // Loading state for initial load
  if (loadingMessages) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="text-lg">Loading messages...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with Logout Button */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent flex items-center gap-2">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                <span className="hidden sm:inline">Chat Forum</span>
                <span className="sm:hidden">Chat</span>
              </CardTitle>
              {/* <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm sm:text-base"
              >
                Logout
              </Button> */}
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">Connect and share with the community</p>
            {pagination && (
              <p className="text-xs text-muted-foreground">
                Showing {messages.length} of {pagination.total} messages
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Messages Area */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Messages ({messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <ScrollArea className="h-[400px] sm:h-[500px] pr-2 sm:pr-4">
              {hasMore && (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={loadMoreMessages}
                    disabled={loadingMore}
                    className="w-full gap-2 text-sm"
                  >
                    {loadingMore ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Loading older messages...
                      </>
                    ) : (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Load older messages
                      </>
                    )}
                  </Button>
                </div>
              )}
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
                  <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-base sm:text-lg">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Be the first to start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((msg) => {
                    const isImage = /\.(jpe?g|png|gif|webp|bmp)$/i.test(msg.fileUrl || '');
                    const messageComments = msg.comments || [];
                    const isExpanded = expandedComments[msg._id];
                    return (
                      <Card key={msg._id} className="border border-slate-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start gap-2 sm:gap-3 mb-3">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                              <AvatarFallback className={msg.user === 'Anonymous' ? 'bg-slate-500' : 'bg-red-500'}>
                                {msg.user === 'Anonymous' ? (
                                  <UserX className="h-4 w-4 sm:h-5 sm:w-5" />
                                ) : (
                                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-2 mb-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-sm">{msg.user}</span>
                                  {msg.user === 'Anonymous' && (
                                    <Badge variant="secondary" className="text-xs">
                                      Anonymous
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {new Date(msg.createdAt).toLocaleString(undefined, {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })}
                                </div>
                              </div>
                                        {msg.text && (
                                          <p className="text-sm text-slate-700 mb-2 leading-relaxed break-words break-all whitespace-pre-wrap w-full overflow-x-auto">
                                            {msg.text}
                                          </p>
                                        )}
                              {msg.fileUrl && (
                                <div className="mt-3">
                                   <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                     <div className="flex flex-col sm:flex-row items-start gap-3">
                                       <div className="flex-shrink-0">
                                  {isImage ? (
                                    <div className="relative inline-block">
                                      <img
                                        src={msg.fileUrl || '/placeholder.svg'}
                                        alt="attachment"
                                               className="w-16 h-16 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => window.open(msg.fileUrl, '_blank')}
                                               onError={(e) => {
                                                 console.error('Image failed to load:', msg.fileUrl);
                                                 e.target.src = '/placeholder.svg';
                                               }}
                                               onLoad={() => console.log('Image loaded successfully:', msg.fileUrl)}
                                             />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                              <div className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                              </div>
                                            </div>
                                    </div>
                                  ) : (
                                          <div className="w-16 h-16 bg-slate-200 rounded-lg border flex items-center justify-center">
                                            {getFileIcon(msg.fileUrl)}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                          <span className="text-sm font-medium text-slate-700 break-all">
                                            {msg.fileUrl.split('/').pop() || 'File'}
                                          </span>
                                          <Badge variant="secondary" className="text-xs">
                                            {getFileType(msg.fileUrl)}
                                          </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
                                          <span className="flex items-center gap-1">
                                            <File className="h-3 w-3" />
                                            {getFileType(msg.fileUrl)}
                                          </span>
                                          {msg.fileSize && (
                                            <span>{formatFileSize(msg.fileSize)}</span>
                                          )}
                                        </div>
                                        <div className="mt-2 flex flex-col sm:flex-row gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-2 bg-white hover:bg-slate-50 text-xs w-full sm:w-auto"
                                      onClick={() => window.open(msg.fileUrl, '_blank')}
                                    >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 bg-white hover:bg-slate-50 text-xs w-full sm:w-auto"
                                            onClick={() => {
                                              const link = document.createElement('a');
                                              link.href = msg.fileUrl;
                                              link.download = msg.fileUrl.split('/').pop();
                                              link.click();
                                            }}
                                          >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download
                                    </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleComments(msg._id)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                {messageComments.length} {messageComments.length === 1 ? 'comment' : 'comments'}
                              </Button>
                            </div>
                            {(isExpanded || messageComments.length === 0) && (
                              <div className="space-y-2 ml-2 sm:ml-4">
                                {messageComments.map((comment) => (
                                  <div
                                    key={comment._id}
                                    className="flex gap-2 p-2 bg-slate-50 rounded-md border-l-2 border-red-200"
                                  >
                                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                                      <AvatarFallback className="text-xs bg-slate-400">
                                        {getUserInitials(comment.user || 'User')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                        <span className="text-xs font-medium">{comment.user || 'User'}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(comment.createdAt).toLocaleTimeString()}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-600">{comment.text}</p>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                  <Input
                                    placeholder="Write a comment..."
                                    className="text-sm h-8 flex-1 min-w-0"
                                    value={commentInputs[msg._id] || ''}
                                    onChange={(e) =>
                                      setCommentInputs((prev) => ({ ...prev, [msg._id]: e.target.value }))
                                    }
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && postComment(msg._id)}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => postComment(msg._id)}
                                    disabled={!commentInputs[msg._id]?.trim()}
                                    className="h-8 px-3 flex-shrink-0 w-full sm:w-auto"
                                  >
                                    <Send className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* New Message Input */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">New Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Your name"
                  value={anonymous ? '' : session.user.name}
                  disabled
                  className="w-full text-sm sm:text-base"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="file-upload" className="cursor-pointer w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent text-xs sm:text-sm w-full sm:w-auto" asChild>
                    <span>
                      <Paperclip className="h-4 w-4" />
                      <span className="hidden sm:inline">{file ? file.name : 'Attach File'}</span>
                      <span className="sm:hidden">{file ? file.name.substring(0, 15) + '...' : 'File'}</span>
                    </span>
                  </Button>
                </label>
                <input 
                  id="file-upload" 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
                />
              </div>
            </div>
              {file && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {file.type.startsWith('image/') ? (
                        <div className="w-16 h-16 bg-slate-200 rounded-lg border flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-slate-500" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-200 rounded-lg border flex items-center justify-center">
                          <File className="h-8 w-8 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {file.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {getFileType(file.name)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{file.type}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setFile(null)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
              </div>
            </div>
              )}
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
                className="min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="anonymous" checked={anonymous} onCheckedChange={setAnonymous} />
                  <label
                    htmlFor="anonymous"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Post as anonymous
                  </label>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={(!message && !file) || isLoading}
                  className="gap-2 min-w-[100px] w-full sm:w-auto"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isLoading ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}