import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { User } from '../../types';

interface UserSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
  placeholder?: string;
}

export function UserSelector({
  value,
  onChange,
  label,
  error,
  className = '',
  placeholder = 'Select a user'
}: UserSelectorProps) {
  const { users, loading, error: storeError, initialize } = useUserStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (!isInitialized) {
          console.log('Initializing UserSelector...');
          const unsubscribe = await initialize();
          setIsInitialized(true);
          console.log('UserSelector initialized with users:', users);
          return () => {
            if (unsubscribe) {
              unsubscribe();
            }
          };
        }
      } catch (err) {
        console.error('Error initializing UserSelector:', err);
      }
    };
    init();
  }, [initialize, isInitialized, users]);

  // Log any changes to users
  useEffect(() => {
    if (users.length > 0) {
      console.log('Users updated:', { 
        count: users.length, 
        users: users.map(u => ({ 
          id: u.id, 
          firstName: u.firstName,
          lastName: u.lastName,
          name: `${u.firstName} ${u.lastName}` 
        }))
      });
    }
  }, [users]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (storeError) {
    console.error('UserStore error:', storeError);
    return (
      <div className="text-red-500 text-sm">
        Error loading users. Please try again.
      </div>
    );
  }

  const selectedUser = users.find(user => user.id === value);
  const displayName = (user: User) => {
    if (!user.name) return user.email || '';
    return user.name;
  };

  // Sort users by display name
  const sortedUsers = [...users].sort((a, b) => {
    const nameA = displayName(a);
    const nameB = displayName(b);
    return nameA.localeCompare(nameB);
  });

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative mt-1">
        <Listbox value={value} onChange={onChange}>
          {({ open }) => (
            <>
              <Listbox.Button className={`
                relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left 
                border border-gray-300 dark:border-gray-600
                focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 
                focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300
                ${error ? 'border-red-500' : ''}
              `}>
                <span className="block truncate text-gray-900 dark:text-gray-100">
                  {selectedUser ? displayName(selectedUser) : placeholder}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? 'transform rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                show={open}
                as={React.Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {sortedUsers.map((user) => (
                    <Listbox.Option
                      key={user.id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' : 
                                  'text-gray-900 dark:text-gray-100'
                        }`
                      }
                      value={user.id}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {displayName(user)}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                              <Check className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </>
          )}
        </Listbox>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
