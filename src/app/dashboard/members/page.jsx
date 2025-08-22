'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MembersPage() {
  const [activeMembers, setActiveMembers] = useState([]);
  const [expiredMembers, setExpiredMembers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newMember, setNewMember] = useState({
    fullName: '',
    lastName: '',
    email: '',
    phone: '',
    affiliation: '',
    password: '',
    role: '',
    billingName: '',
    billingAddress: '',
    membershipExpiry: '',
    shareInfoInternally: false,
    memberType: 'member',
    businessName: '',
    businessWebsite: '',
    isAdmin: false,
  });
  const [activePage, setActivePage] = useState(1);
  const [expiredPage, setExpiredPage] = useState(1);
  const [activeTotalPages, setActiveTotalPages] = useState(1);
  const [expiredTotalPages, setExpiredTotalPages] = useState(1);
  const [activeTotalCount, setActiveTotalCount] = useState(0);
  const [expiredTotalCount, setExpiredTotalCount] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchActiveMembers = async (pageNumber = 1) => {
    try {
      console.log('Fetching active members, page:', pageNumber);
      const res = await fetch(`/api/member?page=${pageNumber}&limit=10&status=active`);
      const data = await res.json();
      console.log('Active members response:', data);
      
      if (!res.ok) {
        console.error('Failed to fetch active members:', data);
        return;
      }
      
      setActiveMembers(data.members || []);
      setActiveTotalPages(data.totalPages || 1);
      setActiveTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching active members:', error);
    }
  };

  const fetchExpiredMembers = async (pageNumber = 1) => {
    try {
      const res = await fetch(`/api/member?page=${pageNumber}&limit=10&status=expired`);
      const data = await res.json();
      
      if (!res.ok) {
        console.error('Failed to fetch expired members:', data);
        return;
      }
      
      setExpiredMembers(data.members || []);
      setExpiredTotalPages(data.totalPages || 1);
      setExpiredTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching expired members:', error);
    }
  };

  useEffect(() => {
    fetchActiveMembers(activePage);
  }, [activePage]);

  useEffect(() => {
    fetchExpiredMembers(expiredPage);
  }, [expiredPage]);

  // Fetch initial counts on component mount
  useEffect(() => {
    const fetchInitialCounts = async () => {
      try {
        // Fetch active members count
        const activeRes = await fetch('/api/member?page=1&limit=1&status=active');
        const activeData = await activeRes.json();
        if (activeRes.ok) {
          setActiveTotalCount(activeData.total || 0);
        }

        // Fetch expired members count
        const expiredRes = await fetch('/api/member?page=1&limit=1&status=expired');
        const expiredData = await expiredRes.json();
        if (expiredRes.ok) {
          setExpiredTotalCount(expiredData.total || 0);
        }
      } catch (error) {
        console.error('Error fetching initial counts:', error);
      }
    };

    fetchInitialCounts();
  }, []);

  const handleDelete = async (id) => {
    await fetch(`/api/member/${id}`, { method: 'DELETE' });
    fetchActiveMembers(activePage);
    fetchExpiredMembers(expiredPage);
    
    // Refresh total counts after deletion
    const activeRes = await fetch('/api/member?page=1&limit=1&status=active');
    const activeData = await activeRes.json();
    if (activeRes.ok) {
      setActiveTotalCount(activeData.total || 0);
    }

    const expiredRes = await fetch('/api/member?page=1&limit=1&status=expired');
    const expiredData = await expiredRes.json();
    if (expiredRes.ok) {
      setExpiredTotalCount(expiredData.total || 0);
    }
  };

  const handleEdit = (member) => {
    setEditId(member._id);
    setEditData({
      ...member,
      membershipExpiry: member.membershipExpiry ? new Date(member.membershipExpiry).toISOString().split('T')[0] : ''
    });
  };

  const handleSave = async () => {
    const res = await fetch(`/api/member/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    const updated = await res.json();
    
    // Update the appropriate list based on membership status
    if (updated.member.membershipStatus === 'active' && 
        (!updated.member.membershipExpiry || new Date(updated.member.membershipExpiry) > new Date())) {
      setActiveMembers(activeMembers.map((m) => (m._id === editId ? updated.member : m)));
    } else {
      setExpiredMembers(expiredMembers.map((m) => (m._id === editId ? updated.member : m)));
    }
    setEditId(null);
    
    // Refresh total counts after editing
    const activeRes = await fetch('/api/member?page=1&limit=1&status=active');
    const activeData = await activeRes.json();
    if (activeRes.ok) {
      setActiveTotalCount(activeData.total || 0);
    }

    const expiredRes = await fetch('/api/member?page=1&limit=1&status=expired');
    const expiredData = await expiredRes.json();
    if (expiredRes.ok) {
      setExpiredTotalCount(expiredData.total || 0);
    }
  };

  const handleCreate = async () => {
    try {
      // Clear previous messages
      setError('');
      setSuccess('');
      setIsCreating(true);
      
      console.log('Creating member with data:', newMember);
      
      const res = await fetch('/api/member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      
      const created = await res.json();
      console.log('Member creation response:', created);
      
      if (!res.ok) {
        console.error('Failed to create member:', created);
        
        // Handle specific error types
        if (created.error === 'Email already exists') {
          setError('❌ Email already exists: A member with this email address already exists. Please use a different email or check if the member is already in the system.');
        } else if (created.error === 'Missing required fields') {
          setError(`❌ Missing required fields: ${created.message}`);
        } else if (created.error === 'Invalid email format') {
          setError('❌ Invalid email format: Please enter a valid email address');
        } else if (created.error === 'Password too short') {
          setError('❌ Password too short: Password must be at least 6 characters long');
        } else if (created.error === 'Invalid role') {
          setError('❌ Invalid role: Please select a valid role from the dropdown');
        } else if (created.error === 'Invalid member type') {
          setError('❌ Invalid member type: Please select a valid member type');
        } else if (created.error === 'Business name required') {
          setError('❌ Business name required: Business name is required when member type is set to Business');
        } else if (created.error === 'Validation error') {
          setError(`❌ Validation error: ${created.message}`);
        } else if (created.error === 'Duplicate field') {
          setError(`❌ Duplicate field: ${created.message}`);
        } else {
          setError(`❌ Failed to create member: ${created.message || created.error || 'Unknown error'}`);
        }
        return;
      }
      
      console.log('Member created successfully, refreshing lists...');
      
      // Show success message
      setSuccess('✅ Member created successfully!');
      
      // Reset form
      setNewMember({
        fullName: '',
        lastName: '',
        email: '',
        phone: '',
        affiliation: '',
        password: '',
        role: '',
        billingName: '',
        billingAddress: '',
        membershipExpiry: '',
        shareInfoInternally: false,
        memberType: 'member',
        businessName: '',
        businessWebsite: '',
        isAdmin: false,
      });
      
              // Clear any error messages
      setError('');
      
      setActivePage(1);
      await fetchActiveMembers(1);
      
      // Refresh total counts after creation
      const activeRes = await fetch('/api/member?page=1&limit=1&status=active');
      const activeData = await activeRes.json();
      if (activeRes.ok) {
        setActiveTotalCount(activeData.total || 0);
      }

      const expiredRes = await fetch('/api/member?page=1&limit=1&status=expired');
      const expiredData = await expiredRes.json();
      if (expiredRes.ok) {
        setExpiredTotalCount(expiredData.total || 0);
      }
      
      console.log('Lists refreshed');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error) {
      console.error('Error creating member:', error);
      setError(`❌ Network error: ${error.message}. Please check your connection and try again.`);
    } finally {
      setIsCreating(false);
    }
  };

  const getMembershipStatus = (member) => {
    if (!member.membershipExpiry) return { status: 'No expiry set', color: 'bg-gray-100 text-gray-800' };
    
    const now = new Date();
    const expiry = new Date(member.membershipExpiry);
    const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return { status: `Expired ${Math.abs(daysRemaining)} days ago`, color: 'bg-red-100 text-red-800' };
    } else if (daysRemaining <= 30) {
      return { status: `Expires in ${daysRemaining} days`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: `Expires in ${daysRemaining} days`, color: 'bg-green-100 text-green-800' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderMemberCard = (member, isExpired = false) => {
    const membershipInfo = getMembershipStatus(member);
    
    return (
      <Card key={member._id} className={`${isExpired ? 'border-red-200 bg-red-50' : ''}`}>
        <CardContent className="p-4">
          {editId === member._id ? (
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name"
                  value={editData.fullName || ''}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                />
                <Input
                  placeholder="Last Name"
                  value={editData.lastName || ''}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
                <Input
                  placeholder="Phone"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />
                <Input
                  placeholder="Affiliation"
                  value={editData.affiliation || ''}
                  onChange={(e) => setEditData({ ...editData, affiliation: e.target.value })}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={editData.role || ''}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                >
                  <option value="">Select Role</option>
                  <option value="full">Full Member</option>
                  <option value="affiliate">Affiliate Member</option>
                  <option value="studentbt">Student/BT</option>
                </select>
                <Input
                  placeholder="Billing Name"
                  value={editData.billingName || ''}
                  onChange={(e) => setEditData({ ...editData, billingName: e.target.value })}
                />
                <Input
                  placeholder="Billing Address"
                  value={editData.billingAddress || ''}
                  onChange={(e) => setEditData({ ...editData, billingAddress: e.target.value })}
                />
                <Input
                  placeholder="Membership Expiry"
                  type="date"
                  value={editData.membershipExpiry || ''}
                  onChange={(e) => setEditData({ ...editData, membershipExpiry: e.target.value })}
                />
              </div>

              {/* Admin Access Control */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-3">Admin Access Control</h4>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`adminAccess-${member._id}`}
                    checked={editData.isAdmin || false}
                    onChange={(e) => setEditData({ ...editData, isAdmin: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor={`adminAccess-${member._id}`} className="text-sm font-medium text-gray-700">
                    Grant Admin Access (Dashboard & Management)
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Admin users have access to all dashboard features and member management
                </p>
              </div>

              {/* Internal Sharing Preferences */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-semibold mb-3">Directory & Sharing Settings</h4>
                <div className="space-y-3">
                  {/* Share Info Internally Checkbox */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`shareInfo-${member._id}`}
                      checked={editData.shareInfoInternally || false}
                      onChange={(e) => setEditData({ ...editData, shareInfoInternally: e.target.checked })}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor={`shareInfo-${member._id}`} className="text-sm font-medium text-gray-700">
                      Show in Member Directory (share information internally)
                    </label>
                  </div>

                  {/* Member Type Selection - only show if sharing is enabled */}
                  {editData.shareInfoInternally && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Member Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'member', label: 'Member' },
                          { value: 'supervisor', label: 'Supervisor' },
                          { value: 'business', label: 'Business' }
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setEditData({ ...editData, memberType: type.value })}
                            className={`p-2 border rounded text-sm ${
                              editData.memberType === type.value
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business-specific fields */}
                  {editData.shareInfoInternally && editData.memberType === 'business' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Business Name"
                        value={editData.businessName || ''}
                        onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                      />
                      <Input
                        placeholder="Business Website (Optional)"
                        value={editData.businessWebsite || ''}
                        onChange={(e) => setEditData({ ...editData, businessWebsite: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{member.fullName} {member.lastName}</h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <p className="text-sm text-gray-600">Phone: {member.phone || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Role: {member.role || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Affiliation: {member.affiliation || 'N/A'}</p>
                  
                  {/* Admin Status */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">Admin Access:</span>
                      {member.isAdmin ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ✓ Admin User
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Regular Member
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Directory & Sharing Info */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">Directory:</span>
                      {member.shareInfoInternally ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Visible ({member.memberType || 'member'})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Hidden
                        </span>
                      )}
                    </div>
                    {member.shareInfoInternally && member.memberType === 'business' && member.businessName && (
                      <p className="text-xs text-gray-600 mt-1">Business: {member.businessName}</p>
                    )}
                  </div>
                </div>
                <Badge className={membershipInfo.color}>
                  {membershipInfo.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Signup Date:</span>
                  <p>{formatDate(member.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium">Expiry Date:</span>
                  <p>{formatDate(member.membershipExpiry)}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2 mt-4">
            {editId === member._id ? (
              <Button size="sm" onClick={handleSave}>Save</Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>Edit</Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => handleDelete(member._id)}>Delete</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Members Management</h1>

      {/* Create New Member */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Member</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-md font-semibold mb-3">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="Full Name *"
                    value={newMember.fullName}
                    onChange={(e) => {
                      setNewMember({ ...newMember, fullName: e.target.value });
                      if (error) setError('');
                    }}
                    className={!newMember.fullName.trim() ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {!newMember.fullName.trim() && (
                    <p className="text-xs text-red-600 mt-1">Full Name is required</p>
                  )}
                </div>
                <div>
                  <Input
                    placeholder="Last Name"
                    value={newMember.lastName}
                    onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Email *"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => {
                      setNewMember({ ...newMember, email: e.target.value });
                      if (error) setError('');
                    }}
                    className={!newMember.email.trim() ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {!newMember.email.trim() && (
                    <p className="text-xs text-red-600 mt-1">Email is required</p>
                  )}
                </div>
                <div>
                  <Input
                    placeholder="Phone"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Affiliation"
                    value={newMember.affiliation}
                    onChange={(e) => setNewMember({ ...newMember, affiliation: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Password *"
                    type="password"
                    value={newMember.password}
                    onChange={(e) => {
                      setNewMember({ ...newMember, password: e.target.value });
                      if (error) setError('');
                    }}
                    className={!newMember.password.trim() ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  {!newMember.password.trim() && (
                    <p className="text-xs text-red-600 mt-1">Password is required</p>
                  )}
                  {newMember.password && newMember.password.length < 6 && (
                    <p className="text-xs text-red-600 mt-1">Password must be at least 6 characters</p>
                  )}
                </div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                >
                  <option value="">Select Role</option>
                  <option value="full">Full Member</option>
                  <option value="affiliate">Affiliate Member</option>
                  <option value="studentbt">Student/BT</option>
                </select>
                <Input
                  placeholder="Billing Name"
                  value={newMember.billingName}
                  onChange={(e) => setNewMember({ ...newMember, billingName: e.target.value })}
                />
                <Input
                  placeholder="Billing Address"
                  value={newMember.billingAddress}
                  onChange={(e) => setNewMember({ ...newMember, billingAddress: e.target.value })}
                />
                <Input
                  placeholder="YYYY-MM-DD"
                  type="date"
                  value={newMember.membershipExpiry}
                  onChange={(e) => setNewMember({ ...newMember, membershipExpiry: e.target.value })}
                />
              </div>
            </div>

            {/* Admin Access Control */}
            <div>
              <h4 className="text-md font-semibold mb-3">Admin Access Control</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="newMemberAdminAccess"
                    checked={newMember.isAdmin}
                    onChange={(e) => setNewMember({ ...newMember, isAdmin: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="newMemberAdminAccess" className="text-sm font-medium text-gray-700">
                    Grant Admin Access (Dashboard & Management)
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  ⚠️ Admin users have access to all dashboard features and member management
                </p>
              </div>
            </div>

            {/* Directory & Sharing Settings */}
            <div>
              <h4 className="text-md font-semibold mb-3">Directory & Sharing Settings</h4>
              <div className="space-y-4">
                {/* Share Info Internally Checkbox */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="newMemberShareInfo"
                    checked={newMember.shareInfoInternally}
                    onChange={(e) => setNewMember({ ...newMember, shareInfoInternally: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="newMemberShareInfo" className="text-sm font-medium text-gray-700">
                    Show in Member Directory (share information internally)
                  </label>
                </div>

                {/* Member Type Selection - only show if sharing is enabled */}
                {newMember.shareInfoInternally && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Member Type</label>
                    <div className="grid grid-cols-3 gap-2 max-w-md">
                      {[
                        { value: 'member', label: 'Member' },
                        { value: 'supervisor', label: 'Supervisor' },
                        { value: 'business', label: 'Business' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setNewMember({ ...newMember, memberType: type.value })}
                          className={`p-2 border rounded text-sm ${
                            newMember.memberType === type.value
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business-specific fields */}
                {newMember.shareInfoInternally && newMember.memberType === 'business' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                    <Input
                      placeholder="Business Name"
                      value={newMember.businessName}
                      onChange={(e) => setNewMember({ ...newMember, businessName: e.target.value })}
                    />
                    <Input
                      placeholder="Business Website (Optional)"
                      value={newMember.businessWebsite}
                      onChange={(e) => setNewMember({ ...newMember, businessWebsite: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleCreate} 
            className="mt-6" 
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Add Member'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Members Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Members ({activeTotalCount})</TabsTrigger>
          <TabsTrigger value="expired">Expired Members ({expiredTotalCount})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {activeMembers.map((member) => renderMemberCard(member, false))}
          </div>
          
          {/* Active Members Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              disabled={activePage === 1}
            >
              Previous
            </Button>
            <span>Page {activePage} of {activeTotalPages}</span>
            <Button
              variant="outline"
              onClick={() => setActivePage((p) => Math.min(activeTotalPages, p + 1))}
              disabled={activePage === activeTotalPages}
            >
              Next
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="expired" className="space-y-4">
          <div className="grid gap-4">
            {expiredMembers.map((member) => renderMemberCard(member, true))}
          </div>
          
          {/* Expired Members Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setExpiredPage((p) => Math.max(1, p - 1))}
              disabled={expiredPage === 1}
            >
              Previous
            </Button>
            <span>Page {expiredPage} of {expiredTotalPages}</span>
            <Button
              variant="outline"
              onClick={() => setExpiredPage((p) => Math.min(expiredTotalPages, p + 1))}
              disabled={expiredPage === expiredTotalPages}
            >
              Next
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
