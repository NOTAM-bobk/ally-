import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Check, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  X, 
  MoreVertical, 
  Bell,
  Search,
  CheckCircle2,
  Circle,
  CheckSquare,
  CalendarDays,
  FileText,
  ChevronDown,
  ChevronRight,
  Sun,
  Zap,
  Mic
} from 'lucide-react';

// --- Constants & Initial Data ---
const INITIAL_CATEGORIES = ['All', 'Personal', 'Work', 'Health', 'Shopping'];

const INITIAL_REMINDERS = [
  { id: 1, title: 'Weekly Team Sync', notes: 'Discuss Q3 roadmap and project milestones.', date: '2026-07-20', time: '10:00', completed: false, category: 'Work' },
  { id: 2, title: 'Buy Groceries', notes: 'Milk, eggs, sourdough bread, avocados, coffee beans.', date: '2026-07-19', time: '18:00', completed: false, category: 'Shopping' },
  { id: 3, title: 'Dentist Appointment', notes: 'Dr. Smith - Routine checkup.', date: '2026-07-25', time: '14:30', completed: false, category: 'Health' },
  { id: 4, title: 'Read "Design Patterns"', notes: 'Finish chapters 4 and 5.', date: '', time: '', completed: true, category: 'Personal' },
];

export default function App() {
  // --- State ---
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  const [showCompleted, setShowCompleted] = useState(true);
  
  // New/Edit Reminder Form State
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');

  // --- Handlers ---
  const toggleComplete = (id) => {
    setReminders(reminders.map(rem => 
      rem.id === id ? { ...rem, completed: !rem.completed } : rem
    ));
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter(rem => rem.id !== id));
  };

  const handleSaveReminder = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (editingId !== null) {
      setReminders(reminders.map(rem => 
        rem.id === editingId ? {
          ...rem, 
          title: newTitle, 
          notes: newNotes, 
          date: newDate, 
          time: newTime, 
          category: newCategory
        } : rem
      ));
    } else {
      const newReminder = {
        id: Date.now(),
        title: newTitle,
        notes: newNotes,
        date: newDate,
        time: newTime,
        completed: false,
        category: newCategory,
      };
      setReminders([newReminder, ...reminders]);
    }
    closeModal();
  };

  const openEditModal = (rem) => {
    setEditingId(rem.id);
    setNewTitle(rem.title);
    setNewNotes(rem.notes || '');
    setNewDate(rem.date || '');
    setNewTime(rem.time || '');
    setNewCategory(rem.category || 'Personal');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewTitle('');
    setNewNotes('');
    setNewDate('');
    setNewTime('');
    setNewCategory('Personal');
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    
    if (!categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
    }
    setActiveCategory(trimmed); // Auto-select the newly created group
    setNewCategoryName('');
    setIsCategoryModalOpen(false);
  };

  const applyQuickDate = (type) => {
    const targetDate = new Date();
    
    if (type === '1hr') {
      targetDate.setHours(targetDate.getHours() + 1);
    } else if (type === 'evening') {
      targetDate.setHours(18, 0, 0, 0); // 6:00 PM today
    } else if (type === 'tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
      targetDate.setHours(9, 0, 0, 0); // 9:00 AM tomorrow
    }
    
    // Formatting correctly to local YYYY-MM-DD and HH:MM for HTML inputs
    const localDate = new Date(targetDate.getTime() - (targetDate.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
    const localTime = targetDate.toTimeString().slice(0, 5);

    setNewDate(localDate);
    setNewTime(localTime);
  };

  // --- Derived Data ---
  const filteredReminders = reminders.filter(rem => {
    const matchesCategory = activeCategory === 'All' || rem.category === activeCategory;
    const matchesSearch = rem.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rem.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeReminders = filteredReminders.filter(rem => !rem.completed);
  const completedReminders = filteredReminders.filter(rem => rem.completed);

  // --- Helper to format date ---
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr && !timeStr) return null;
    
    let formattedDate = '';
    if (dateStr) {
      const dateObj = new Date(dateStr);
      // Adjusting for timezone offset to prevent off-by-one day errors locally
      const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);
      
      formattedDate = adjustedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    let formattedTime = '';
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const standardHours = h % 12 || 12;
      formattedTime = `${standardHours}:${minutes} ${ampm}`;
    }

    return [formattedDate, formattedTime].filter(Boolean).join(' • ');
  };

  return (
    <div className="min-h-screen bg-[#FDFBFF] text-slate-800 font-sans selection:bg-violet-200">
      
      {/* --- Top App Bar --- */}
      <header className="sticky top-0 z-10 bg-[#FDFBFF]/80 backdrop-blur-md px-6 py-4 md:py-6 flex flex-col gap-4 max-w-3xl mx-auto border-b border-transparent transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-normal tracking-tight text-slate-900">
            {activeTab === 'tasks' ? 'Reminders' : 
             activeTab === 'planner' ? 'Daily Planner' :
             activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-medium text-lg">
            G
          </div>
        </div>

        {/* Search Bar (Material 3 Search style) */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search reminders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F0EDF7] hover:bg-[#E8E4F2] focus:bg-[#E8E4F2] text-slate-800 rounded-full py-3.5 pl-12 pr-12 focus:outline-none transition-colors placeholder-slate-500"
          />
          <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-violet-600 transition-colors">
            <Mic className="h-5 w-5" />
          </button>
        </div>

        {/* Categories Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border flex-shrink-0 ${
                activeCategory === category
                  ? 'bg-violet-100 text-violet-900 border-violet-100 shadow-sm'
                  : 'bg-transparent text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {category}
            </button>
          ))}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-dashed flex-shrink-0 bg-transparent text-slate-500 border-slate-300 hover:bg-slate-50 hover:text-slate-700 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 pt-4">
        {activeTab === 'tasks' ? (
          <>
            {/* Active Reminders */}
            <div className="space-y-2.5">
              {activeReminders.length === 0 && completedReminders.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-10 h-10 text-violet-300" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-800 mb-2">No reminders yet</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Add a new reminder to keep track of your tasks, appointments, and ideas.</p>
                </div>
              ) : activeReminders.length === 0 && searchQuery ? (
                <div className="text-center py-10 text-slate-500">No active results for "{searchQuery}"</div>
              ) : (
                activeReminders.map(rem => (
                  <ReminderCard 
                    key={rem.id} 
                    reminder={rem} 
                    onToggle={() => toggleComplete(rem.id)} 
                    onDelete={() => deleteReminder(rem.id)}
                    onEdit={() => openEditModal(rem)}
                    formatDateTime={formatDateTime}
                  />
                ))
              )}
            </div>

            {/* Completed Reminders */}
            {completedReminders.length > 0 && (
              <div className="mt-10">
                <div 
                  className="flex items-center gap-2 mb-3 px-2 cursor-pointer select-none w-max"
                  onClick={() => setShowCompleted(!showCompleted)}
                >
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completed</h2>
                  {showCompleted ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
                
                {showCompleted && (
                  <div className="space-y-2.5">
                    {completedReminders.map(rem => (
                      <ReminderCard 
                        key={rem.id} 
                        reminder={rem} 
                        onToggle={() => toggleComplete(rem.id)} 
                        onDelete={() => deleteReminder(rem.id)}
                        onEdit={() => openEditModal(rem)}
                        formatDateTime={formatDateTime}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 px-4 animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              {activeTab === 'calendar' ? <CalendarDays className="w-10 h-10 text-slate-400" /> : 
               activeTab === 'planner' ? <Sun className="w-10 h-10 text-slate-400" /> :
               <FileText className="w-10 h-10 text-slate-400" />}
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2 capitalize">
              {activeTab === 'planner' ? 'Daily Planner' : activeTab}
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto">This section is currently empty or under construction.</p>
          </div>
        )}
      </main>

      {/* --- Floating Action Button (FAB) --- */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-6 md:right-12 z-30 bg-rose-200 text-rose-900 p-3.5 rounded-2xl shadow-md hover:shadow-lg hover:bg-rose-300 active:scale-95 transition-all flex items-center justify-center group"
        aria-label="Add Reminder"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* --- Bottom Navigation Bar --- */}
      <nav className="fixed bottom-0 w-full bg-[#FDFBFF] border-t border-slate-100 flex justify-around items-center px-2 py-1.5 z-40 pb-3 sm:pb-1.5 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        {[
          { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
          { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
          { id: 'planner', icon: Sun, label: 'Planner' },
          { id: 'notes', icon: FileText, label: 'Notes' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 w-20 py-1"
            >
              <div className={`px-4 py-1 rounded-full transition-colors duration-300 ${isActive ? 'bg-violet-100 text-violet-900' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] font-medium transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* --- Add Reminder Bottom Sheet / Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-[#FDFBFF] w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-8 duration-300"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-normal text-slate-900">{editingId ? 'Edit reminder' : 'New reminder'}</h2>
              <button 
                onClick={closeModal}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveReminder} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-6 pb-6 mt-2">
                
                {/* Title Input */}
                <div className="bg-[#F4F1FA] rounded-t-[20px] rounded-b-[8px] p-4 border-b-2 border-slate-300 focus-within:border-violet-600 transition-colors">
                  <label className="text-xs font-semibold text-violet-800 mb-1 block">Title</label>
                  <input
                    type="text"
                    placeholder="What do you need to do?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent text-lg text-slate-900 placeholder-slate-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Notes Input */}
                <div className="bg-[#F4F1FA] rounded-t-[20px] rounded-b-[8px] p-4 border-b-2 border-slate-300 focus-within:border-violet-600 transition-colors">
                  <label className="text-xs font-semibold text-violet-800 mb-1 block">Details</label>
                  <textarea
                    placeholder="Add details (optional)..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent text-slate-800 placeholder-slate-500 focus:outline-none resize-none"
                  />
                </div>
                
                {/* Quick Due Dates */}
                <div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mt-2">
                    <button type="button" onClick={() => applyQuickDate('1hr')} className="px-3.5 py-1.5 bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold whitespace-nowrap hover:bg-rose-200 flex items-center gap-1.5 transition-colors">
                      <Zap className="w-3.5 h-3.5" /> In 1 hour
                    </button>
                    <button type="button" onClick={() => applyQuickDate('evening')} className="px-3.5 py-1.5 bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold whitespace-nowrap hover:bg-rose-200 flex items-center gap-1.5 transition-colors">
                      <Clock className="w-3.5 h-3.5" /> This evening
                    </button>
                    <button type="button" onClick={() => applyQuickDate('tomorrow')} className="px-3.5 py-1.5 bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold whitespace-nowrap hover:bg-rose-200 flex items-center gap-1.5 transition-colors">
                      <Sun className="w-3.5 h-3.5" /> Tomorrow
                    </button>
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-[#F4F1FA] rounded-t-[20px] rounded-b-[8px] p-4 border-b-2 border-slate-300 focus-within:border-violet-600 transition-colors">
                    <label className="text-xs font-semibold text-violet-800 mb-1 block">Date</label>
                    <div className="relative flex items-center">
                      <CalendarIcon className="h-5 w-5 text-slate-500 mr-2" />
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-transparent text-slate-800 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-[#F4F1FA] rounded-t-[20px] rounded-b-[8px] p-4 border-b-2 border-slate-300 focus-within:border-violet-600 transition-colors">
                    <label className="text-xs font-semibold text-violet-800 mb-1 block">Time</label>
                    <div className="relative flex items-center">
                      <Clock className="h-5 w-5 text-slate-500 mr-2" />
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full bg-transparent text-slate-800 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Selector */}
                <div>
                  <label className="text-sm font-semibold text-slate-800 mb-3 block px-1">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c !== 'All').map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setNewCategory(category)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border flex items-center gap-2 ${
                          newCategory === category
                            ? 'bg-violet-100 text-violet-900 border-violet-200'
                            : 'bg-transparent text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {newCategory === category && <Check className="w-4 h-4" />}
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
              
              {/* Actions */}
              <div className="sticky bottom-0 bg-[#FDFBFF] pt-4 pb-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 rounded-full text-sm font-medium text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-6 py-2.5 rounded-full text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors shadow-sm"
                >
                  {editingId ? 'Save Changes' : 'Save Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Add Category Modal --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FDFBFF] w-full max-w-sm rounded-[28px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-normal text-slate-900 mb-4">New group</h3>
            <form onSubmit={handleAddCategory}>
              <div className="bg-[#F4F1FA] rounded-t-[16px] rounded-b-[8px] p-4 border-b-2 border-slate-300 focus-within:border-violet-600 transition-colors mb-6">
                <input
                  type="text"
                  placeholder="Group name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-base text-slate-900 placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsCategoryModalOpen(false); setNewCategoryName(''); }}
                  className="px-5 py-2 rounded-full text-sm font-medium text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="px-5 py-2 rounded-full text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Basic Custom Scrollbar Styles for the Modal */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
}

// --- Individual Reminder Card Component ---
function ReminderCard({ reminder, onToggle, onDelete, onEdit, formatDateTime }) {
  const { title, notes, date, time, completed, category } = reminder;
  const dateTimeStr = formatDateTime(date, time);

  // Swipe / Drag State
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const wasDraggedRef = useRef(false);

  // Animation State
  const [animationState, setAnimationState] = useState('');

  const handleToggleWithAnimation = (e) => {
    if (e) e.stopPropagation();
    setAnimationState(completed ? 'restoring' : 'completing');
    setTimeout(() => {
      onToggle();
      setAnimationState('');
    }, 300); // Wait for the transition to finish
  };

  const handleDeleteWithAnimation = (e) => {
    if (e) e.stopPropagation();
    setAnimationState('deleting');
    setTimeout(() => {
      onDelete();
    }, 300);
  };

  const handleStart = (clientX) => {
    startXRef.current = clientX;
    setIsDragging(true);
    wasDraggedRef.current = false;
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    const diff = clientX - startXRef.current;
    if (Math.abs(diff) > 5) {
      wasDraggedRef.current = true;
    }
    // Dampen the drag distance slightly for an organic feel
    setDragX(diff * 0.6);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (dragX > 80) {
      handleToggleWithAnimation(); // Swiped right to complete
    } else if (dragX < -80) {
      handleDeleteWithAnimation(); // Swiped left to delete
    }
    
    setDragX(0); // Snap back visually
    // Reset drag ref shortly after to allow regular clicks to pass through if it wasn't a drag
    setTimeout(() => {
      wasDraggedRef.current = false;
    }, 50);
  };
  
  const handleCardClick = (e) => {
    e.stopPropagation();
    if (!wasDraggedRef.current) {
      onEdit();
    }
  };

  // Styles for background reveal
  const swipeBgColor = dragX > 0 ? 'bg-green-100' : dragX < 0 ? 'bg-red-100' : 'bg-transparent';

  // Dynamic classes for completion/deletion animation
  const getAnimationClass = () => {
    if (animationState === 'completing') return 'scale-90 opacity-0 translate-x-8 bg-green-50';
    if (animationState === 'restoring') return 'scale-90 opacity-0 -translate-x-8 bg-slate-50';
    if (animationState === 'deleting') return 'scale-90 opacity-0 -translate-x-8 bg-red-50';
    return 'scale-100 opacity-100';
  };

  return (
    <div className={`relative overflow-hidden rounded-[20px] transition-all duration-300 ease-out origin-center ${completed && !animationState ? 'opacity-60' : ''} ${getAnimationClass()}`}>
      {/* Swipe Action Backgrounds */}
      <div className={`absolute inset-0 flex justify-between items-center px-5 transition-colors duration-300 ${swipeBgColor}`}>
        <div className={`flex items-center gap-1.5 font-medium text-green-700 transition-opacity duration-200 ${dragX > 40 ? 'opacity-100' : 'opacity-0'}`}>
          <CheckCircle2 className="w-5 h-5" /> <span className="text-xs font-bold">Complete</span>
        </div>
        <div className={`flex items-center gap-1.5 font-medium text-red-600 transition-opacity duration-200 ${dragX < -40 ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-xs font-bold">Delete</span> <Trash2 className="w-5 h-5" />
        </div>
      </div>

      {/* Foreground Card */}
      <div 
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        style={{ transform: `translateX(${dragX}px)` }}
        className={`group relative flex gap-3 p-3 rounded-[20px] cursor-grab active:cursor-grabbing transition-transform ${isDragging ? 'duration-0' : 'duration-300 ease-out'} ${
          completed 
            ? 'bg-[#FDFBFF] border border-slate-200/50' 
            : 'bg-white border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]'
        }`}
      >
        
        {/* Checkbox Area */}
        <div className="flex-shrink-0 pt-0.5">
          <button 
            onClick={handleToggleWithAnimation}
            className="w-5 h-5 rounded-full flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 relative z-10"
            aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {completed ? (
              <CheckCircle2 className="w-5 h-5 text-violet-600" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-slate-400 hover:border-violet-500 transition-colors" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pr-2 select-none cursor-pointer" onClick={handleCardClick}>
          <h3 className={`text-base font-medium leading-snug truncate transition-colors ${
            completed ? 'text-slate-500 line-through' : 'text-slate-800'
          }`}>
            {title}
          </h3>
          
          {notes && (
            <p className={`mt-0.5 text-xs leading-relaxed line-clamp-2 ${
              completed ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {notes}
            </p>
          )}

          {/* Metadata Footer */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {dateTimeStr && (
              <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                completed ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-600'
              }`}>
                {time ? <Clock className="w-3 h-3" /> : <CalendarIcon className="w-3 h-3" />}
                <span>{dateTimeStr}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">
              <Circle className="w-1.5 h-1.5 fill-slate-400 text-slate-400" />
              <span>{category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
