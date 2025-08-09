import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaShareAlt, FaDownload, FaSpinner } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import archivedEventsService from '../../services/archivedEventsService';
import ImageLightbox from '../../components/ImageLightbox';
import Breadcrumb from '../../components/Breadcrumb';
import ContactButtons from '../../components/ContactButtons';
import { showToast } from '../../components/Toast';
import { scrollToTop } from '../../utils/scrollUtils';

const ArchivedEventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching event details for ID:', id);
        const data = await archivedEventsService.getById(id);
        console.log('Received event data:', data);
        setEvent(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date not available';
    }
  };

  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleShare = async () => {
    console.log('Share button clicked');
    setSharing(true);

    const shareData = {
      title: event.title || 'Chinmaya Mission Archived Event',
      text: event.description ? event.description.substring(0, 200) + (event.description.length > 200 ? '...' : '') : 'Check out this archived event from Chinmaya Mission Vasai',
      url: window.location.href
    };

    console.log('Share data:', shareData);

    // Check if Web Share API is supported (mainly mobile browsers)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      console.log('Using Web Share API');
      try {
        await navigator.share(shareData);
        console.log('Event shared successfully via Web Share API');
      } catch (error) {
        // User cancelled the share or there was an error
        if (error.name !== 'AbortError') {
          console.error('Error sharing via Web Share API:', error);
          // Fallback to clipboard
          await copyToClipboard();
        } else {
          console.log('User cancelled sharing');
        }
      }
    } else {
      console.log('Web Share API not available, using clipboard fallback');
      // Fallback for desktop browsers or when Web Share API is not available
      await copyToClipboard();
    }

    setSharing(false);
  };

  const copyToClipboard = async () => {
    console.log('Attempting to copy to clipboard');
    try {
      if (navigator.clipboard && window.isSecureContext) {
        console.log('Using modern clipboard API');
        // Modern clipboard API (requires HTTPS)
        await navigator.clipboard.writeText(window.location.href);
        console.log('Successfully copied to clipboard via modern API');
        showToast('Event link copied to clipboard!', 'success');
      } else {
        console.log('Using fallback clipboard method');
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const success = document.execCommand('copy');
          console.log('Fallback copy success:', success);
          if (success) {
            showToast('Event link copied to clipboard!', 'success');
          } else {
            showToast('Could not copy link. Please copy manually from the address bar.', 'error');
          }
        } catch (err) {
          console.error('Fallback copy failed:', err);
          showToast('Could not copy link. Please copy manually from the address bar.', 'error');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Could not copy link. Please copy manually from the address bar.', 'error');
    }
  };

  const handleBackToEventsClick = () => {
    scrollToTop();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#BC3612] dark:border-[#F47930]"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg max-w-md mx-auto">
            <p className="mb-4">{error || 'Event not found'}</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/archived-events"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Back to Events
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare images for lightbox
  const lightboxImages = (event.allImages || event.images || [])?.map((img, index) => ({
    url: typeof img === 'string' ? img : img.url,
    caption: typeof img === 'string' ? `${event.title} - Photo ${index + 1}` : (img.caption || `${event.title} - Photo ${index + 1}`)
  })) || [];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Archived Events', href: '/archived-events' },
    { label: event.title }
  ];

  const allImages = event.allImages || event.images || [];

  return (
    <>
      <Helmet>
        <title>{event.title} | Archived Events | Chinmaya Mission Vasai</title>
        <meta name="description" content={event.description} />
        <meta name="keywords" content={`${event.title}, archived event, Chinmaya Mission Vasai`} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description} />
        <meta property="og:image" content={event.coverImage} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              to="/archived-events"
              onClick={handleBackToEventsClick}
              className="inline-flex items-center text-[#BC3612] dark:text-[#F47930] hover:text-[#ff725e] dark:hover:text-[#ff725e] mb-6 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Archived Events
            </Link>

            {/* Event Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
              {/* Hero Image */}
              {event.coverImage && (
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {event.title}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-white/90">
                      {event.date && (
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-4 h-4 mr-2" />
                          {formatDate(event.date)}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                      )}
                      {event.attendees && (
                        <div className="flex items-center">
                          <FaUsers className="w-4 h-4 mr-2" />
                          {event.attendees} attendees
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    disabled={sharing}
                    className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors"
                    aria-label={sharing ? "Sharing event..." : "Share event"}
                  >
                    {sharing ? (
                      <FaSpinner className="w-5 h-5 animate-spin" />
                    ) : (
                      <FaShareAlt className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Event Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    About This Event
                  </h2>
                  <div className="prose max-w-none text-gray-600 dark:text-gray-300">
                    <p className="text-lg leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Event Gallery */}
                {allImages && allImages.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      Event Gallery ({allImages.length} photos)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {allImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square"
                          onClick={() => handleImageClick(index)}
                        >
                          <img
                            src={typeof image === 'string' ? image : (image.url || image)}
                            alt={typeof image === 'string' ? `Event photo ${index + 1}` : (image.caption || `Event photo ${index + 1}`)}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                <FaDownload className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Event Details */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Event Details
                  </h3>
                  <div className="space-y-3">
                    {event.date && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</dt>
                        <dd className="text-gray-900 dark:text-white">{formatDate(event.date)}</dd>
                      </div>
                    )}
                    {event.time && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</dt>
                        <dd className="text-gray-900 dark:text-white">{event.time}</dd>
                      </div>
                    )}
                    {event.location && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</dt>
                        <dd className="text-gray-900 dark:text-white">{event.location}</dd>
                      </div>
                    )}
                    {event.organizer && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Organizer</dt>
                        <dd className="text-gray-900 dark:text-white">{event.organizer}</dd>
                      </div>
                    )}
                    {event.attendees && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendees</dt>
                        <dd className="text-gray-900 dark:text-white">{event.attendees}</dd>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Contact
                  </h3>
                  <ContactButtons
                    showLabel={false}
                    layout="vertical"
                    size="default"
                  />
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleShare}
                      disabled={sharing}
                      className="w-full flex items-center justify-center px-4 py-3 bg-[#BC3612] dark:bg-[#F47930] hover:bg-[#ff725e] dark:hover:bg-[#ff725e] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      {sharing ? (
                        <>
                          <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                          Sharing...
                        </>
                      ) : (
                        <>
                          <FaShareAlt className="w-4 h-4 mr-2" />
                          Share Event
                        </>
                      )}
                    </button>
                    <Link
                      to="/archived-events"
                      onClick={handleBackToEventsClick}
                      className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                    >
                      <FaArrowLeft className="w-4 h-4 mr-2" />
                      Back to Events
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Lightbox */}
        {lightboxImages.length > 0 && (
          <ImageLightbox
            images={lightboxImages}
            isOpen={lightboxOpen}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default ArchivedEventDetails;
