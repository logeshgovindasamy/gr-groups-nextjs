"use client";

import { useEffect, useState } from "react";
import { 
  BookOpen, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Award, 
  Users, 
  Globe, 
  Heart,
  Smile,
  Star,
  ShoppingBag,
  TrendingUp,
  Gem,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

// Icon mapping dictionary for previews
const iconMap = {
  Users,
  Globe,
  Award,
  Heart,
  Smile,
  Star,
  ShoppingBag,
  TrendingUp,
  Gem,
  Sparkles
};

export default function AdminStoryPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  // Form State
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  
  const [missionTitle, setMissionTitle] = useState("");
  const [missionDescription, setMissionDescription] = useState("");

  const [stats, setStats] = useState([
    { icon: "Users", value: "", label: "" },
    { icon: "Globe", value: "", label: "" },
    { icon: "Award", value: "", label: "" },
    { icon: "Heart", value: "", label: "" }
  ]);

  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    fetchStorySettings();
  }, []);

  const fetchStorySettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/story");
      const result = await res.json();

      if (res.ok && result.success) {
        const { data } = result;
        setHeroTitle(data.heroTitle || "");
        setHeroSubtitle(data.heroSubtitle || "");
        setHeroDescription(data.heroDescription || "");
        
        setMissionTitle(data.missionTitle || "");
        setMissionDescription(data.missionDescription || "");

        if (Array.isArray(data.stats)) {
          setStats(data.stats);
        }
        if (Array.isArray(data.timeline)) {
          setTimeline(data.timeline);
        }
      } else {
        toast.error("Failed to load story settings");
      }
    } catch (error) {
      toast.error("An error occurred while loading settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const res = await fetch("/api/admin/settings/story", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          heroTitle,
          heroSubtitle,
          heroDescription,
          missionTitle,
          missionDescription,
          stats,
          timeline
        })
      });

      const result = await res.json();
      if (res.ok || result.success) {
        toast.success("Our Story details updated successfully!");
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  // Stat Change Handler
  const handleStatChange = (index, field, value) => {
    setStats(prev => {
      const newStats = [...prev];
      if (newStats[index]) {
        newStats[index] = { ...newStats[index], [field]: value };
      }
      return newStats;
    });
  };

  // Timeline Handlers
  const handleTimelineChange = (index, field, value) => {
    setTimeline(prev => {
      const newTimeline = [...prev];
      if (newTimeline[index]) {
        newTimeline[index] = { ...newTimeline[index], [field]: value };
      }
      return newTimeline;
    });
  };

  const addTimelineMilestone = () => {
    setTimeline(prev => [
      ...prev,
      { year: new Date().getFullYear().toString(), title: "New Milestone", desc: "Description of milestone..." }
    ]);
    toast.success("Milestone added to journey!");
  };

  const deleteTimelineMilestone = (index) => {
    setTimeline(prev => prev.filter((_, idx) => idx !== index));
    toast.success("Milestone removed");
  };

  const moveTimelineItem = (index, direction) => {
    setTimeline(prev => {
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;

      const newTimeline = [...prev];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      
      const temp = newTimeline[index];
      newTimeline[index] = newTimeline[targetIdx];
      newTimeline[targetIdx] = temp;
      
      return newTimeline;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-2 text-[#6d7175]">
        <Loader2 className="animate-spin text-accent" size={24} />
        <p className="font-semibold text-xs">Loading Story CMS...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#1a1d1f]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-[#1a1d1f]">
            <BookOpen className="text-accent" size={22} />
            Our Story Editor
          </h2>
          <p className="text-xs text-[#6d7175] mt-0.5">Manage intro, key statistics, brand mission, and timeline milestones.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving Story...
            </>
          ) : (
            <>
              <Save size={14} />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Editor Tabs Navigation */}
      <div className="flex border border-[#e1e3e5] gap-1 bg-[#f6f6f7] p-1 rounded-lg shadow-xs">
        {[
          { id: "hero", label: "Hero Banner" },
          { id: "stats", label: "Key Metrics" },
          { id: "mission", label: "Mission Statement" },
          { id: "timeline", label: "Journey Milestones" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-[#1a1d1f] border border-[#e1e3e5] shadow-xs"
                : "text-[#6d7175] hover:text-[#1a1d1f] hover:bg-white/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor Content Area */}
      <div className="bg-white border border-[#e1e3e5] rounded-xl p-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Tab 1: Hero Settings */}
          {activeTab === "hero" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#1a1d1f]">Hero Section Details</h3>
                <p className="text-xs text-[#6d7175] mt-0.5">Configure the top introduction block of the brand story page.</p>
              </div>
              <hr className="border-[#e1e3e5]" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Category Subtitle</label>
                  <input
                    type="text"
                    required
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="e.g. Our Story"
                    className="w-full px-3 py-2 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Main Heading Title</label>
                  <input
                    type="text"
                    required
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="e.g. Redefining Luxury for the Modern Era"
                    className="w-full px-3 py-2 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Hero Description Text</label>
                <textarea
                  rows="5"
                  required
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  placeholder="Explain your business values and style philosophy..."
                  className="w-full px-3 py-2 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f] resize-none"
                ></textarea>
              </div>
            </div>
          )}

          {/* Tab 2: Stats Settings */}
          {activeTab === "stats" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#1a1d1f]">Key Metrics</h3>
                <p className="text-xs text-[#6d7175] mt-0.5">Provide 4 metrics to highlight company achievement highlights.</p>
              </div>
              <hr className="border-[#e1e3e5]" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {stats.map((stat, index) => {
                  const SelectedIcon = iconMap[stat.icon] || Heart;
                  return (
                    <div key={index} className="bg-white border border-[#e1e3e5] p-5 rounded-xl shadow-xs flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Metric #{index + 1}</span>
                        <div className="w-8 h-8 rounded-full bg-[#f1f2f4] border border-[#e1e3e5] text-[#1a1d1f] flex items-center justify-center shadow-xs">
                          <SelectedIcon size={15} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Value</label>
                          <input
                            type="text"
                            required
                            value={stat.value}
                            onChange={(e) => handleStatChange(index, "value", e.target.value)}
                            placeholder="e.g. 50K+"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-[#1a1d1f]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Label</label>
                          <input
                            type="text"
                            required
                            value={stat.label}
                            onChange={(e) => handleStatChange(index, "label", e.target.value)}
                            placeholder="e.g. Customers"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-[#1a1d1f]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Icon representation</label>
                        <select
                          value={stat.icon}
                          onChange={(e) => handleStatChange(index, "icon", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-[#1a1d1f]"
                        >
                          {Object.keys(iconMap).map((iconKey) => (
                            <option key={iconKey} value={iconKey}>{iconKey}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Mission Statement */}
          {activeTab === "mission" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#1a1d1f]">Brand Mission Statement</h3>
                <p className="text-xs text-[#6d7175] mt-0.5">Formulate the primary focus statement and company core mission.</p>
              </div>
              <hr className="border-[#e1e3e5]" />

              <div>
                <label className="block text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Mission Heading</label>
                <input
                  type="text"
                  required
                  value={missionTitle}
                  onChange={(e) => setMissionTitle(e.target.value)}
                  placeholder="e.g. Our Mission"
                  className="w-full px-3 py-2 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6d7175] uppercase tracking-wider mb-1.5">Mission description statement</label>
                <textarea
                  rows="5"
                  required
                  value={missionDescription}
                  onChange={(e) => setMissionDescription(e.target.value)}
                  placeholder="Describe your core operations and purpose..."
                  className="w-full px-3 py-2 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all text-[#1a1d1f] resize-none"
                ></textarea>
              </div>
            </div>
          )}

          {/* Tab 4: Journey Timeline */}
          {activeTab === "timeline" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-[#1a1d1f]">Journey Milestones</h3>
                  <p className="text-xs text-[#6d7175] mt-0.5">Tell your company timeline story milestone by milestone.</p>
                </div>
                <button
                  type="button"
                  onClick={addTimelineMilestone}
                  className="btn-outline flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                >
                  <Plus size={13} /> Add Milestone
                </button>
              </div>
              <hr className="border-[#e1e3e5]" />

              {timeline.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#babfc3] rounded-xl text-[#6d7175]">
                  <p className="font-bold text-xs text-[#1a1d1f]">No Milestones Added</p>
                  <p className="text-xs mt-0.5">There are currently no milestones in your brand journey.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {timeline.map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-white border border-[#e1e3e5] p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center"
                    >
                      {/* Left: Reordering Controls */}
                      <div className="flex md:flex-col gap-1 items-center justify-center shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveTimelineItem(index, "up")}
                          className="p-1 bg-white border border-[#babfc3] rounded hover:bg-[#f6f6f7] text-[#6d7175] disabled:opacity-30 disabled:hover:bg-white"
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <span className="text-[10px] font-bold text-[#6d7175] w-5 text-center">{index + 1}</span>
                        <button
                          type="button"
                          disabled={index === timeline.length - 1}
                          onClick={() => moveTimelineItem(index, "down")}
                          className="p-1 bg-white border border-[#babfc3] rounded hover:bg-[#f6f6f7] text-[#6d7175] disabled:opacity-30 disabled:hover:bg-white"
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>

                      {/* Middle: Content Fields */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3.5 w-full">
                        <div className="sm:col-span-1">
                          <label className="block text-[10px] font-bold text-[#6d7175] uppercase tracking-wider mb-1">Year</label>
                          <input
                            type="text"
                            required
                            value={item?.year || ""}
                            onChange={(e) => handleTimelineChange(index, "year", e.target.value)}
                            placeholder="e.g. 2024"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-[#1a1d1f]"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-[#6d7175] uppercase tracking-wider mb-1">Heading / Title</label>
                          <input
                            type="text"
                            required
                            value={item?.title || ""}
                            onChange={(e) => handleTimelineChange(index, "title", e.target.value)}
                            placeholder="e.g. Sustainability Milestone"
                            className="w-full px-2.5 py-1.5 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-[#1a1d1f]"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-[#6d7175] uppercase tracking-wider mb-1">Milestone Description</label>
                          <textarea
                            rows="2"
                            required
                            value={item?.desc || ""}
                            onChange={(e) => handleTimelineChange(index, "desc", e.target.value)}
                            placeholder="Briefly describe what achievements were made..."
                            className="w-full px-2.5 py-1.5 bg-white border border-[#babfc3] rounded-lg text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-[#1a1d1f] resize-none"
                          />
                        </div>
                      </div>

                      {/* Right: Deletion Button */}
                      <button
                        type="button"
                        onClick={() => deleteTimelineMilestone(index)}
                        className="p-2 text-[#6d7175] hover:text-[#d82c0d] hover:bg-[#fff0f0] hover:border-red-200 border border-transparent rounded-lg transition-all self-end md:self-center shrink-0"
                        title="Delete Milestone"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions Form Footer */}
          <div className="pt-5 border-t border-[#e1e3e5] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving Story...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Story Details
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
