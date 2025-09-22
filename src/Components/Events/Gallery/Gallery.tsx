import {
  useParams,
  useSearchParams,
} from "react-router-dom";
import "./Gallery.css";
import { db } from "../../../../firebase-config";
import {
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  collection,
  query,
  where,
  doc,
} from "firebase/firestore";
import {
  useCollection,
  useDocument,
} from "react-firebase-hooks/firestore";
import EventModel from "../../../Models/EventModel";
import { EventInfo } from "./EventInfo";
import { authStore } from "../../../Context/AuthState";
import eventService from "../../../Services/EventService";
import { Modal } from "antd";
import SEO from "../../SEO/SEO";

export function Gallery(): React.ReactElement {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();

  // Get eventId from either URL parameter or query parameter
  const finalEventId =
    eventId || searchParams.get("event");

  // Carousel state
  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState<number | null>(null);
  const [isCarouselOpen, setIsCarouselOpen] =
    useState(false);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);
  const [
    deletingPhotoIndex,
    setDeletingPhotoIndex,
  ] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] =
    useState(false);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = () => {
      const token = authStore.getState().token;
      setIsAdmin(!!token);
    };

    checkAdminStatus();

    // Subscribe to auth changes
    const unsubscribe = authStore.subscribe(
      checkAdminStatus
    );
    return unsubscribe;
  }, []);

  // Load event data
  const eventDocRef = useMemo(() => {
    return finalEventId
      ? doc(db, "events", finalEventId)
      : null;
  }, [finalEventId]);

  const [
    eventSnapshot,
    eventLoading,
    eventError,
  ] = useDocument(eventDocRef);

  // Load gallery photos
  const galleryQuery = useMemo(() => {
    return finalEventId
      ? query(
          collection(db, "galleries"),
          where("eventId", "==", finalEventId)
        )
      : null;
  }, [finalEventId]);

  const [
    gallerySnapshot,
    galleryLoading,
    galleryError,
  ] = useCollection(galleryQuery);

  const event: EventModel | null = useMemo(() => {
    if (!eventSnapshot || !eventSnapshot.exists())
      return null;
    const data = eventSnapshot.data();
    // Convert Firestore Timestamp to string
    const eventDate =
      data.date?.toDate?.() ||
      new Date(data.date);
    const createdAtDate =
      data.createdAt?.toDate?.() ||
      new Date(data.createdAt);

    return new EventModel(
      eventSnapshot.id,
      data.title,
      data.type,
      eventDate.toISOString(),
      data.time || "",
      data.description || "",
      data.location,
      data.locationLink || "",
      data.coverImageId || "",
      data.coverImageUrl || "",
      createdAtDate.toISOString(),
      data.hasGallery || false
    );
  }, [eventSnapshot]);

  const galleryPhotos = useMemo(() => {
    if (!gallerySnapshot || gallerySnapshot.empty)
      return [];
    const galleryDoc = gallerySnapshot.docs[0];
    const data = galleryDoc.data();
    return data.photos || [];
  }, [gallerySnapshot]);

  // Carousel functions
  const openCarousel = (index: number) => {
    setSelectedImageIndex(index);
    setIsCarouselOpen(true);
  };

  const closeCarousel = () => {
    setIsCarouselOpen(false);
    setSelectedImageIndex(null);
  };

  const goToNext = () => {
    if (
      selectedImageIndex !== null &&
      selectedImageIndex <
        galleryPhotos.length - 1
    ) {
      setSelectedImageIndex(
        selectedImageIndex + 1
      );
    }
  };

  const goToPrevious = () => {
    if (
      selectedImageIndex !== null &&
      selectedImageIndex > 0
    ) {
      setSelectedImageIndex(
        selectedImageIndex - 1
      );
    }
  };

  // Keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent
  ) => {
    if (e.key === "Escape") {
      closeCarousel();
    } else if (e.key === "ArrowRight") {
      goToNext();
    } else if (e.key === "ArrowLeft") {
      goToPrevious();
    }
  };

  // Delete functionality
  const openDeleteModal = (
    photoIndex: number
  ) => {
    setDeletingPhotoIndex(photoIndex);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingPhotoIndex(null);
  };

  const confirmDeletePhoto = async () => {
    if (
      deletingPhotoIndex === null ||
      !finalEventId
    )
      return;

    try {
      setIsDeleting(true);

      const photoToDelete =
        galleryPhotos[deletingPhotoIndex];

      await eventService.deleteGalleryPhoto(
        finalEventId,
        photoToDelete.id
      );

      // Close modal and reset state
      closeDeleteModal();

      // If we were viewing this photo in carousel, close it
      if (
        isCarouselOpen &&
        selectedImageIndex === deletingPhotoIndex
      ) {
        closeCarousel();
      }
    } catch (error) {
      alert("שגיאה במחיקת התמונה. אנא נסה שוב.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (eventLoading || galleryLoading) {
    return (
      <div className="Gallery">
        <div className="loading">טוען...</div>
      </div>
    );
  }

  if (eventError || galleryError) {
    console.error("Gallery Error:", {
      eventError,
      galleryError,
    });
    return (
      <div className="Gallery">
        <div className="error">
          שגיאה בטעינת הגלריה:{" "}
          {eventError?.message ||
            galleryError?.message ||
            "אנא נסה שוב מאוחר יותר"}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="Gallery">
        <div className="error">אירוע לא נמצא</div>
      </div>
    );
  }

  return (
    <div className="Gallery">
      <SEO
        title={`גלריית תמונות - ${event.title} | סמ״ר גל בסון ז״ל`}
        description={`גלריית תמונות מאירוע: ${event.title}. צפה בתמונות לזכרו של סמ״ר גל בסון ז״ל, לוחם ביחידת יהל״ם של חיל ההנדסה הקרבית.`}
        keywords={[
          // Gallery-specific Keywords
          "גלריית תמונות גל בסון",
          "תמונות יחידת יהל״ם",
          "תמונות יחידת יהלום",
          "גלריה זיכרון",
          "תמונות אירועי הנצחה",
          "תמונות הנצחה גל בסון",
          "גלריה גל בסון",
          "תמונות זיכרון יחידת יהלום",

          // Memorial Keywords
          "תמונות זיכרון",
          "גלריה זיכרון גל בסון",
          "תמונות אירועים גל בסון",
          "תמונות יחידת יהלום זיכרון",

          // English Variations
          "Gallery Gal Bason",
          "Memorial Photos",
          "Gal Bason photos",
          "Yahalom unit gallery",
          "Memorial image gallery",
        ]}
        url={`https://remembergalbasson.com/gallery?event=${finalEventId}`}
        canonicalUrl={`https://remembergalbasson.com/gallery?event=${finalEventId}`}
      />

      {/* Event Info at the top */}
      <EventInfo event={event} />

      {/* Gallery Photos Section */}
      <div className="gallery-section">
        <h2 className="gallery-title">
          גלריית תמונות
        </h2>

        {galleryPhotos.length === 0 ? (
          <div className="no-photos">
            אין תמונות בגלריה עדיין
          </div>
        ) : (
          <div className="gallery-grid">
            {galleryPhotos.map(
              (photo: any, index: number) => (
                <div
                  key={photo.id || index}
                  className="gallery-item"
                >
                  <img
                    src={photo.url}
                    alt={`תמונה ${index + 1}`}
                    className="gallery-image"
                    loading="lazy"
                    onClick={() =>
                      openCarousel(index)
                    }
                  />
                  <div className="gallery-item-overlay">
                    <span
                      className="zoom-icon"
                      onClick={() =>
                        openCarousel(index)
                      }
                    >
                      🔍
                    </span>
                    {isAdmin && (
                      <button
                        className="delete-photo-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(index);
                        }}
                        title="מחק תמונה"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Carousel Modal */}
      {isCarouselOpen &&
        selectedImageIndex !== null && (
          <div
            className="carousel-modal"
            onClick={closeCarousel}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div
              className="carousel-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="carousel-close"
                onClick={closeCarousel}
              >
                ✕
              </button>

              {/* Previous Button */}
              {selectedImageIndex > 0 && (
                <button
                  className="carousel-nav carousel-prev"
                  onClick={goToPrevious}
                >
                  ‹
                </button>
              )}

              {/* Current Image */}
              <div className="carousel-image-container">
                <img
                  src={
                    galleryPhotos[
                      selectedImageIndex
                    ].url
                  }
                  alt={`תמונה ${
                    selectedImageIndex + 1
                  }`}
                  className="carousel-image"
                />
              </div>

              {/* Next Button */}
              {selectedImageIndex <
                galleryPhotos.length - 1 && (
                <button
                  className="carousel-nav carousel-next"
                  onClick={goToNext}
                >
                  ›
                </button>
              )}

              {/* Image Counter */}
              <div className="carousel-counter">
                {selectedImageIndex + 1} /{" "}
                {galleryPhotos.length}
              </div>

              {/* Thumbnail Strip */}
              <div className="carousel-thumbnails">
                {galleryPhotos.map(
                  (photo: any, index: number) => (
                    <img
                      key={photo.id || index}
                      src={photo.url}
                      alt={`תמונה ${index + 1}`}
                      className={`carousel-thumbnail ${
                        index ===
                        selectedImageIndex
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedImageIndex(
                          index
                        )
                      }
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onCancel={closeDeleteModal}
        footer={null}
        title="מחיקת תמונה"
        centered
        width={400}
        style={{ direction: "rtl" }}
      >
        <div className="delete-modal-content">
          <p>
            האם אתה בטוח שברצונך למחוק תמונה זו?
          </p>
          <p className="delete-warning">
            פעולה זו אינה ניתנת לביטול.
          </p>

          <div className="delete-modal-buttons">
            <button
              className="confirm-delete-btn"
              onClick={confirmDeletePhoto}
              disabled={isDeleting}
            >
              {isDeleting
                ? "מוחק..."
                : "מחק תמונה"}
            </button>
            <button
              className="cancel-delete-btn"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              ביטול
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
