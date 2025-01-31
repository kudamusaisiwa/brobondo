import React, { useEffect, useState } from 'react';
import { useLeadStore, Lead } from '../store/leadStore';
import { useCustomerStore } from '../store/customerStore';
import { 
  Loader2, 
  RefreshCw, 
  Phone, 
  Mail, 
  Tag, 
  Clock, 
  Calendar, 
  MessageSquare, 
  EyeOff, 
  UserPlus, 
  AlertCircle, 
  Edit3, 
  Eye,
  MessageCircle, 
  Send 
} from 'lucide-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import LeadMessagesModal from '../components/modals/LeadMessagesModal';
import SendMessageModal from '../components/modals/SendMessageModal'; // New import

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  qualified: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  lost: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
};

export default function Leads() {
  const { 
    leads, 
    loading, 
    error,
    initialize,
    syncWithManyContact,
    updateLeadStatus,
    updateLeadNotes,
    hideLead,
    convertToCustomer,
    addLeadNote 
  } = useLeadStore();
  
  const { addCustomer } = useCustomerStore();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState<{ type: 'hide' | 'convert'; leadId: string } | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    number: '',
    email: '',
    notes: ''
  });

  const [currentUser] = useState({
    id: 'current-user-id', // TODO: Replace with actual user authentication
    name: 'Current User' // TODO: Replace with actual user name
  });
  const [selectedStatus, setSelectedStatus] = useState<Lead['status'] | 'all'>('all');
  const [showMessagesModal, setShowMessagesModal] = useState(false); // New state
  const [showSendMessageModal, setShowSendMessageModal] = useState(false); // New state

  const filteredLeads = selectedStatus === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === selectedStatus);

  const STATUS_LABELS = {
    all: 'All Leads',
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    converted: 'Converted',
    lost: 'Lost'
  };

  const statusTabs: Array<Lead['status'] | 'all'> = ['all', 'new', 'contacted', 'qualified', 'converted', 'lost'];

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSync = async () => {
    await syncWithManyContact();
  };

  const handleStatusChange = async (leadId: string, status: Lead['status']) => {
    await updateLeadStatus(leadId, status);
  };

  const handleNotesChange = async (leadId: string, notes: string) => {
    await updateLeadNotes(leadId, notes);
  };

  const handleHideLead = async (leadId: string) => {
    try {
      console.log('Attempting to hide lead:', leadId);
      await hideLead(leadId);
      console.log('Lead hidden successfully:', leadId);
      // If the hidden lead was selected, clear the selection
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
        setNotes('');
      }
    } catch (error) {
      console.error('Error hiding lead:', error);
    }
  };

  const handleConvertToCustomer = async (leadId: string) => {
    setShowConfirmModal({ type: 'convert', leadId });
  };

  const handleConfirmAction = async () => {
    if (!showConfirmModal) return;

    try {
      if (showConfirmModal.type === 'hide') {
        await hideLead(showConfirmModal.leadId);
      } else {
        await convertToCustomer(showConfirmModal.leadId);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }

    setShowConfirmModal(null);
  };

  const handleAddNote = async () => {
    console.log('handleAddNote called');
    console.log('Selected Lead:', selectedLead);
    console.log('Notes to add:', notes);

    if (!selectedLead) {
      console.error('No lead selected');
      alert('Please select a lead first');
      return;
    }

    if (!notes.trim()) {
      console.error('Notes are empty');
      alert('Please enter a note');
      return;
    }

    try {
      const noteToAdd = {
        id: `note_${Date.now()}`, // Add a unique identifier
        text: notes.trim(),
        createdAt: Timestamp.now(),
        createdBy: {
          id: currentUser.id,
          name: currentUser.name
        }
      };

      console.log('Attempting to add note:', noteToAdd);
      
      await addLeadNote(selectedLead.id, noteToAdd);
      
      console.log('Note added successfully');
      setNotes(''); // Clear the notes input
    } catch (error) {
      console.error('Failed to add note:', error);
      alert(`Failed to add note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePrepareConversion = (lead: Lead) => {
    // Split name into first and last name
    const nameParts = lead.name.split(' ');
    
    // Handle different note structures
    const leadNotes = Array.isArray(lead.notes) 
      ? lead.notes.map(note => note.text).join('\n')
      : typeof lead.notes === 'string'
        ? lead.notes
        : '';

    setCustomerData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      number: lead.number || '',
      email: lead.email || '',
      notes: leadNotes
    });

    setShowConvertModal(true);
    setSelectedLead(lead);
  };

  const handleConvertToCustomerModal = async () => {
    if (!selectedLead) return;

    try {
      // Add customer with all prefilled values
      const customerId = await addCustomer({
        name: `${customerData.firstName} ${customerData.lastName}`.trim(),
        firstName: customerData.firstName || (selectedLead.name.split(' ')[0] || ''),
        lastName: customerData.lastName || (selectedLead.name.split(' ').slice(1).join(' ') || ''),
        phone: customerData.number || 
               (typeof selectedLead.number === 'string' ? selectedLead.number : 
               (selectedLead.number?.toString() || '')),
        email: customerData.email || selectedLead.email || '',
        notes: customerData.notes ? [customerData.notes] : 
               (typeof selectedLead.notes === 'string' ? [selectedLead.notes] : 
               (Array.isArray(selectedLead.notes) ? selectedLead.notes.map(n => n.text) : [])),
        convertedFromLeadId: selectedLead.id
      });

      // Update lead status
      await updateLeadStatus(selectedLead.id, 'converted');

      // Close modals
      setShowConvertModal(false);
      setSelectedLead(null);

      // Optional: Show success message
      alert('Lead successfully converted to customer!');
    } catch (error) {
      console.error('Conversion error:', error);
      alert(`Failed to convert lead: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLeadCardClick = (lead: Lead) => {
    setSelectedLead(lead);
    setNotes(lead.notes?.[lead.notes.length - 1]?.text || '');
  };

  const handleMessageClick = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLead(lead);
    setNotes(lead.notes?.[lead.notes.length - 1]?.text || '');
    setShowMessagesModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track your potential clients
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
          ) : (
            <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
          )}
          Sync with ManyContact
        </button>
      </div>

      {/* Status Tabs */}
      <div className="mb-4">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Lead['status'] | 'all')}
          >
            {statusTabs.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            {statusTabs.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`
                  px-3 py-2 font-medium text-sm rounded-md
                  ${selectedStatus === status 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'}
                `}
              >
                {STATUS_LABELS[status]} ({status === 'all' 
                  ? leads.length 
                  : leads.filter(lead => lead.status === status).length})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Main content with fixed height container */}
      <div className="h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Scrollable leads list */}
          <div className="lg:col-span-2 overflow-y-auto pr-4 h-full">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLeads
                  .sort((a, b) => b.lastSync.toMillis() - a.lastSync.toMillis())
                  .map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => handleLeadCardClick(lead)}
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-200 ${
                      selectedLead?.id === lead.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {lead.name}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                            </span>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleHideLead(lead.id);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                                title="Hide Lead"
                              >
                                <EyeOff className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrepareConversion(lead);
                                }}
                                className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                                title="Convert to Customer"
                              >
                                <UserPlus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => handleMessageClick(lead, e)}
                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                title="View Messages"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLead(lead);
                                  setShowSendMessageModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                                title="Send Message"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {lead.number && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Phone className="mr-2 h-4 w-4" />
                                <span className="hover:text-gray-700 dark:hover:text-gray-300">
                                  {lead.number}
                                </span>
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Mail className="mr-2 h-4 w-4" />
                                <span className="hover:text-gray-700 dark:hover:text-gray-300">
                                  {lead.email}
                                </span>
                              </div>
                            )}
                            {lead.tags && lead.tags.length > 0 && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Tag className="mr-2 h-4 w-4" />
                                <span>{lead.tags.join(', ')}</span>
                              </div>
                            )}
                            {lead.lastMessageAt && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="mr-2 h-4 w-4" />
                                <span>
                                  Last Contact: {format(lead.lastMessageAt.toDate(), 'MMM d, yyyy HH:mm')}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="mr-2 h-4 w-4" />
                              <span>
                                Last updated {format(lead.lastSync.toDate(), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky details panel */}
          <div className="lg:col-span-1 h-full">
            <div className="sticky top-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
              {selectedLead ? (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Lead Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        value={selectedLead.status}
                        onChange={(e) => handleStatusChange(selectedLead.id, e.target.value as Lead['status'])}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>

                    {selectedLead && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notes
                        </label>
                        <div className="mt-1">
                          <textarea
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Add a new note..."
                          />
                          <button
                            onClick={handleAddNote}
                            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Add Note
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedLead.notes && Array.isArray(selectedLead.notes) && selectedLead.notes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Previous Notes
                        </h4>
                        <div className="space-y-2">
                          {[...selectedLead.notes]
                            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
                            .map((note, index) => (
                            <div 
                              key={index} 
                              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md"
                            >
                              <p className="text-sm text-gray-800 dark:text-gray-200">
                                {note.text}
                              </p>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Added by {note.createdBy.name} on {format(note.createdAt.toDate(), 'MMM d, yyyy HH:mm')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedLead.customFields && Object.keys(selectedLead.customFields).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Custom Fields
                        </h4>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                          {Object.entries(selectedLead.customFields).map(([key, value]) => (
                            <div key={key} className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {key}
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                {value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No lead selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Click on a lead to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 text-yellow-600 dark:text-yellow-500 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Confirm Action</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {showConfirmModal.type === 'hide'
                ? 'Are you sure you want to hide this lead? This action cannot be undone.'
                : 'Are you sure you want to convert this lead to a customer? This will move the lead to your customers list.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${
                  showConfirmModal.type === 'hide'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {showConfirmModal.type === 'hide' ? 'Hide Lead' : 'Convert to Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConvertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 text-yellow-600 dark:text-yellow-500 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Convert Lead to Customer</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={customerData.firstName || (selectedLead?.name.split(' ')[0] || '')}
                    onChange={(e) => setCustomerData(prev => ({
                      ...prev, 
                      firstName: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={customerData.lastName || (selectedLead?.name.split(' ').slice(1).join(' ') || '')}
                    onChange={(e) => setCustomerData(prev => ({
                      ...prev, 
                      lastName: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerData.number || selectedLead?.number || ''}
                  onChange={(e) => setCustomerData(prev => ({
                    ...prev, 
                    number: e.target.value
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  value={customerData.email || selectedLead?.email || ''}
                  onChange={(e) => setCustomerData(prev => ({
                    ...prev, 
                    email: e.target.value
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Notes (from Lead)
                </label>
                <textarea
                  value={
                    customerData.notes || 
                    (typeof selectedLead?.notes === 'string' 
                      ? selectedLead.notes 
                      : Array.isArray(selectedLead?.notes) 
                        ? selectedLead.notes.map(n => n.text).join('\n') 
                        : '')
                  }
                  onChange={(e) => setCustomerData(prev => ({
                    ...prev, 
                    notes: e.target.value
                  }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowConvertModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertToCustomerModal}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 bg-green-600 hover:bg-green-700"
              >
                Convert to Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLead && (
        <LeadMessagesModal
          isOpen={showMessagesModal}
          onClose={() => setShowMessagesModal(false)}
          lead={selectedLead}
        />
      )}
      {selectedLead && (
        <SendMessageModal
          isOpen={showSendMessageModal}
          onClose={() => setShowSendMessageModal(false)}
          lead={selectedLead}
        />
      )}
    </div>
  );
}
