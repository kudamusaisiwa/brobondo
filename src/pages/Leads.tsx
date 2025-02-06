import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Mail, Phone, Tag, Trash, UserCheck, UserX, X, MessageCircle } from 'lucide-react';
import SendMessageModal from '../components/SendMessageModal';
import LeadStatusSelect from '../components/LeadStatusSelect';
import AddLeadForm from '../components/AddLeadForm';
import { useLeadStore } from '../store/leadStore';
import { usePermissions } from '../hooks/usePermissions';
import { useAuthStore } from '../store/authStore';
import { Lead } from '../types';

export default function Leads() {
  const { leads, initialize, loading, error, deleteLead } = useLeadStore();
  const { userRole } = useAuthStore();
  const { canManageLeads, canViewUsers } = usePermissions();
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  if (!canManageLeads) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
      </div>
    );
  }
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [messageModalLead, setMessageModalLead] = useState<Lead | null>(null);

  useEffect(() => {
    const init = async () => {
      const cleanup = await initialize();
      return cleanup;
    };

    const cleanupPromise = init();

    return () => {
      cleanupPromise.then(cleanup => cleanup?.());
    };
  }, [initialize]);

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
      case 'contacted':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
      case 'qualified':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
      case 'converted':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300';
      case 'lost':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error loading leads: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      {isAddLeadOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddLeadOpen(false)}
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                      Add New Lead
                    </h3>
                    <AddLeadForm onClose={() => setIsAddLeadOpen(false)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Leads</h1>
        <button
          onClick={() => setIsAddLeadOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Lead
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Enquiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {lead.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.email && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2" />
                        {lead.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.phone && (
                      <a 
                        href={`tel:${lead.phone}`}
                        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {lead.phone}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {lead.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      {lead.phone && (
                        <button
                          onClick={() => setMessageModalLead(lead)}
                          className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                          title="Send WhatsApp Message"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </button>
                      )}
                      {!lead.convertedToCustomer && (
                        <button
                          onClick={() => setSelectedLead(lead.id)}
                          className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                        >
                          <UserCheck className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this lead?')) {
                            try {
                              await deleteLead(lead.id);
                            } catch (error) {
                              console.error('Error deleting lead:', error);
                              alert('Failed to delete lead');
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {messageModalLead && (
        <SendMessageModal
          phone={messageModalLead.phone}
          onClose={() => setMessageModalLead(null)}
          onSuccess={() => {
            // You could add a success toast here
            console.log('Message sent successfully');
          }}
        />
      )}
    </div>
  );
}
