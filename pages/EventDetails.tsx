import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  User,
  ArrowLeft,
  Heart,
  Clock,
  AlertTriangle,
  Phone,
} from "lucide-react";
import api from "../api/axiosInstance";
import { Event } from "../types";
import { MOCK_EVENTS } from "../services/mockData";
import LoadingScreen from "../components/common/LoadingScreen";

const EventDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${slug}`);
        setEvent(res.data);
      } catch (err: any) {
        console.warn("API failed, trying mock data");
        // Fallback for demo if API fails or event not found
        // Trying to match by slug or ID for robustness in demo
        const mock = MOCK_EVENTS.find(
          (e) => e.slug === slug || e.id === slug || e._id === slug
        );
        if (mock) {
          setEvent(mock);
          setUsingMock(true);
        } else {
          setError("Event not found");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  if (loading) return <LoadingScreen />;

  if (error || !event)
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-xl font-bold mb-4">
          {error || "Event not found"}
        </div>
        <Link
          to="/events"
          className="text-emerald-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Events
        </Link>
      </div>
    );

  const isEventInactive =
    event.status === "completed" || event.status === "cancelled";

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="h-64 md:h-80 bg-emerald-900 relative overflow-hidden">
        <img
          src={
            event.bannerUrl ||
            `https://picsum.photos/1200/600?random=${event._id || event.id}`
          }
          alt={event.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">
            <Link
              to="/events"
              className="text-white/80 hover:text-white flex items-center gap-2 mb-4 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Back to Events
            </Link>
            <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {event.type}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mt-4 shadow-sm">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {usingMock && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-amber-50 text-amber-800 p-3 rounded-lg flex items-center gap-2 border border-amber-200 text-sm">
            <AlertTriangle size={16} />
            <span>Viewing demo data (Backend unavailable)</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              About the Event
            </h2>
            <div className="prose max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-slate-700">
              Event Details
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-emerald-600 mt-1 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Date
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(
                      event.startDate || event.date || ""
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-emerald-600 mt-1 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Location
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {event.location}
                  </p>
                </div>
              </div>

              {/* Organizer Section */}
              {(event.manager ||
                (event.managerIds && event.managerIds.length > 0)) && (
                <div className="flex items-start">
                  <User className="w-5 h-5 text-emerald-600 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Organizer
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {event.manager ||
                        (event.managerIds && event.managerIds[0]?.name)}
                    </p>
                    {event.managerIds &&
                      event.managerIds.length > 0 &&
                      event.managerIds[0]?.phone && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                          <Phone size={12} /> {event.managerIds[0].phone}
                        </p>
                      )}
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <Clock className="w-5 h-5 text-emerald-600 mt-1 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Status
                  </p>
                  <p className="capitalize text-gray-600 dark:text-gray-400">
                    {event.status || "Upcoming"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() =>
                  !isEventInactive &&
                  navigate(`/donate?eventId=${event._id || event.id}`)
                }
                disabled={isEventInactive}
                className={`w-full font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-md transform ${
                  isEventInactive
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-slate-700 dark:text-gray-400 shadow-none"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg active:scale-95"
                }`}
              >
                <Heart size={20} />
                {event.status === "completed"
                  ? "Event Completed"
                  : event.status === "cancelled"
                  ? "Event Cancelled"
                  : "Donate to this Event"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
