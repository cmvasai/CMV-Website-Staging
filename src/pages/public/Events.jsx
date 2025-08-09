import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaEye, FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { scrollToTop } from "../../utils/scrollUtils";

const Events = ({ featuredEvents }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);  // Remove the modal-related useEffect since we're not using modals anymore

  // Extract available years from featured events
  useEffect(() => {
    if (featuredEvents && featuredEvents.length > 0) {
      const years = [...new Set(featuredEvents
        .filter(event => event.date)
        .map(event => new Date(event.date).getFullYear())
      )].sort((a, b) => b - a);

      const yearData = years.map(year => ({
        year,
        count: featuredEvents.filter(event =>
          event.date && new Date(event.date).getFullYear() === year
        ).length
      }));

      setAvailableYears(yearData);
    }
  }, [featuredEvents]);

  // Filter and sort events
  useEffect(() => {
    if (!featuredEvents) {
      setFilteredEvents([]);
      return;
    }

    let filtered = [...featuredEvents];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(event =>
        event.name?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    }

    // Apply year filter
    if (selectedYear) {
      filtered = filtered.filter(event =>
        event.date && new Date(event.date).getFullYear().toString() === selectedYear
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date) - new Date(b.date);
        case 'date_desc':
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date) - new Date(a.date);
        case 'title_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'title_desc':
          return (b.name || '').localeCompare(a.name || '');
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  }, [featuredEvents, searchQuery, selectedYear, sortBy]);

  const handleViewEventDetailsClick = () => {
    scrollToTop();
  };

  const handleViewPastEventsClick = () => {
    scrollToTop();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedYear('');
    setSortBy('date_desc');
  };

  const getSortIcon = (sortType) => {
    if (sortBy !== sortType) return <FaSort className="w-3 h-3 opacity-50" />;
    return sortBy.includes('_asc') ? <FaSortUp className="w-3 h-3" /> : <FaSortDown className="w-3 h-3" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date not available';
    }
  };

  const getResultsText = () => {
    const totalEvents = filteredEvents.length;
    let filterText = '';

    if (selectedYear) filterText += `from ${selectedYear}`;
    if (searchQuery.trim()) {
      filterText += `${filterText ? ' ' : ''}matching "${searchQuery.trim()}"`;
    }

    if (filterText) {
      return `Found ${totalEvents} event${totalEvents !== 1 ? 's' : ''} ${filterText}`;
    }

    return `Showing ${totalEvents} event${totalEvents !== 1 ? 's' : ''}`;
  };

  return (
    <>
      <Helmet>
        <title>Events | Chinmaya Mission Vasai</title>
        <meta name="description" content="Discover our spiritual and cultural events at Chinmaya Mission Vasai. Join transformative experiences including treks, festivals, workshops, and community celebrations." />
        <meta name="keywords" content="events, spiritual events, Chinmaya Mission Vasai, festivals, workshops, community gatherings" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Events
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Chinmaya Mission Vasai hosts a diverse array of spiritual and cultural events throughout the year,
              each designed to blend spiritual wisdom with engaging experiences.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Search and Filter Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search events by title, description, location..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#BC3612] dark:focus:ring-[#F47930] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Filter Toggle Button for Mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden inline-flex items-center px-4 py-3 bg-[#BC3612] dark:bg-[#F47930] text-white rounded-lg hover:bg-[#ff725e] transition-colors"
              >
                <FaFilter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>

            {/* Filters Row */}
            <div className={`flex flex-col md:flex-row gap-4 ${showFilters ? 'block' : 'hidden md:flex'}`}>
              {/* Year Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Year
                </label>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#BC3612] dark:focus:ring-[#F47930] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Years</option>
                  {availableYears.map((yearData) => (
                    <option key={yearData.year} value={yearData.year}>
                      {yearData.year} ({yearData.count} event{yearData.count !== 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort by
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'date_desc', label: 'Newest First', icon: 'date' },
                    { value: 'date_asc', label: 'Oldest First', icon: 'date' },
                    { value: 'title_asc', label: 'A-Z', icon: 'title' },
                    { value: 'title_desc', label: 'Z-A', icon: 'title' }
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => handleSortChange(value)}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${sortBy === value
                        ? 'bg-[#BC3612] dark:bg-[#F47930] text-white'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }`}
                    >
                      {getSortIcon(value)}
                      <span className="ml-1">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedYear || sortBy !== 'date_desc') && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              {getResultsText()}
            </p>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                {searchQuery || selectedYear ? (
                  <>
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-xl mb-2">No events found</p>
                    <p className="mb-4">
                      {searchQuery && selectedYear
                        ? `No events found matching "${searchQuery}" in ${selectedYear}`
                        : searchQuery
                          ? `No events found matching "${searchQuery}"`
                          : `No events found for ${selectedYear}`
                      }
                    </p>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 bg-[#BC3612] dark:bg-[#F47930] hover:bg-[#ff725e] dark:hover:bg-[#ff725e] text-white rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-xl mb-2">No events available</p>
                    <p>Check back later for upcoming events</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.coverImage || '/images/default-event.jpg'}
                      alt={event.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg line-clamp-2">
                        {event.name}
                      </h3>
                    </div>

                    {/* Year Badge */}
                    {event.date && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {new Date(event.date).getFullYear()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      {event.date && (
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <FaCalendarAlt className="w-4 h-4 mr-2 text-[#BC3612] dark:text-[#F47930]" />
                          {formatDate(event.date)}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <FaMapMarkerAlt className="w-4 h-4 mr-2 text-[#BC3612] dark:text-[#F47930]" />
                          {event.location}
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {event.images?.length || 0} photo{(event.images?.length || 0) !== 1 ? 's' : ''}
                      </div>
                      <Link
                        to={`/events/${event._id}`}
                        onClick={handleViewEventDetailsClick}
                        className="inline-flex items-center px-4 py-2 bg-[#BC3612] dark:bg-[#F47930] hover:bg-[#ff725e] dark:hover:bg-[#ff725e] text-white text-sm font-medium rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BC3612] dark:focus:ring-[#F47930]"
                        aria-label={`View details for ${event.name}`}
                      >
                        <FaEye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* "View Past Events" Button */}
          <div className="bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 flex justify-center">
            <Link
              to="/events/archived"
              onClick={handleViewPastEventsClick}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-sm sm:text-base font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              View Past Events
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Events;