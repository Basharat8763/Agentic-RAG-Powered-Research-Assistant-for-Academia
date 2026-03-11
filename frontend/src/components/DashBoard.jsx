import React, { useState, useEffect, useCallback } from "react";
import "../css/DashBoard.css";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedSummaries, setExpandedSummaries] = useState({});
  const [aiSummaryDialog, setAiSummaryDialog] = useState({
    isOpen: false,
    title: "",
    summary: "",
    authors: "",
    isGenerating: false,
  });
  const [citationDialog, setCitationDialog] = useState({
    isOpen: false,
    citationText: "",
    formattedCitation: "",
    isGenerating: false,
  });
  const [profile, setProfile] = useState({
    name: "Loading...",
    institution: "Loading...",
    field: "Loading...",
    email: "Loading...",
    profilePic: null,
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Search filters
  const [filters, setFilters] = useState({
    resultCount: 10,
    year: "",
    fromDate: "",
    toDate: "",
    sortBy: "relevance",
    openAccess: false,
    sortOrder: "desc",
    searchType: "all", // 'title', 'abstract', 'all'
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setProfile({
          name: "Guest User",
          institution: "Not specified",
          field: "Not specified",
          email: "Not available",
          profilePic: null,
        });
        setIsLoadingProfile(false);
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/profile/?id=${authToken}`,
      );
      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setProfile({
        name: data.name || "Unknown",
        institution: data.uni || "Not specified",
        field: data.field || "Not specified",
        email: data.email || "Not available",
        profilePic: data.profilePic || null,
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      setProfile({
        name: "Guest User",
        institution: "Not specified",
        field: "Not specified",
        email: "Not available",
        profilePic: null,
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Format date for API (DD-MM-YYYY)
  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Perform search function
  const performSearch = useCallback(
    async (query = searchQuery) => {
      if (!query.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      if (query.trim().length < 2) {
        setSearchResults([]);
        setHasSearched(true);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const params = new URLSearchParams({
          search: query.trim(),
          result: filters.resultCount,
          sort: filters.sortBy,
          order: filters.sortOrder,
          search_type: filters.searchType,
          ...(filters.year && { year: filters.year }),
          ...(filters.fromDate && { from: formatDateForAPI(filters.fromDate) }),
          ...(filters.toDate && { to: formatDateForAPI(filters.toDate) }),
          ...(filters.openAccess && { openaccess: "true" }),
        });

        const response = await fetch(
          `http://127.0.0.1:8000/search/?${params.toString()}`,
        );

        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setSearchResults(data.datat || []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [filters, searchQuery],
  );

  // Handle form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Apply filters with search
  const applyFiltersAndSearch = () => {
    if (searchQuery.trim().length >= 2) {
      performSearch();
    }
  };

  // Clear all filters and search
  const clearFilters = () => {
    setFilters({
      resultCount: 10,
      year: "",
      fromDate: "",
      toDate: "",
      sortBy: "relevance",
      openAccess: false,
      sortOrder: "desc",
      searchType: "all",
    });
    if (searchQuery.trim().length >= 2) {
      performSearch();
    }
  };

  const toggleSummary = (index) => {
    setExpandedSummaries((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Generate formatted citation
  const generateCitation = (paper) => {
    const title = getTitle(paper);
    const authors = getAuthorsForCitation(paper.about);
    const year =
      paper.about?.["Published "]?.date_parts?.[0]?.[0] ||
      paper.about?.["Published "]?.split("-")[0] ||
      new Date().getFullYear();
    const source = paper.about?.doi || "Unknown Source";
    const doi = paper.about?.doi || "";

    // Format: Authors. (Year). Title. Source. DOI/URL
    let citation = "";

    if (authors) {
      citation += `${authors}, `;
    }

    citation += `(${year}), `;
    citation += `${title}, `;

    if (doi) {
      citation += `https://doi.org/${doi}`;
    } else if (paper.about?.URL) {
      citation += paper.about.URL;
    }

    return citation;
  };

  // Generate citation and show dialog
  const handleGenerateCitation = async (paper) => {
    setCitationDialog({
      isOpen: true,
      citationText: "",
      formattedCitation: generateCitation(paper),
      isGenerating: false,
    });
  };

  // Copy citation to clipboard
  const copyCitationToClipboard = () => {
    navigator.clipboard
      .writeText(citationDialog.formattedCitation)
      .then(() => {
        alert("Citation copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("Failed to copy citation");
      });
  };

  const closeCitationDialog = () => {
    setCitationDialog({
      isOpen: false,
      citationText: "",
      formattedCitation: "",
      isGenerating: false,
    });
  };

  const generateAISummary = async (paper) => {
    const paperTitle = getTitle(paper);
    const authors = getAuthors(paper.about);

    setAiSummaryDialog({
      isOpen: true,
      title: paperTitle,
      summary: "",
      authors: authors,
      isGenerating: true,
    });

    try {
      const question = `Write a comprehensive summary of "${paperTitle}"`;
      const response = await fetch(
        `http://127.0.0.1:8000/question/?question=${encodeURIComponent(question)}`,
      );
      if (!response.ok) throw new Error("AI summary failed");

      const data = await response.json();
      const summary = data.answer?.output || "No summary generated.";

      setAiSummaryDialog((prev) => ({ ...prev, summary, isGenerating: false }));
    } catch (error) {
      console.error("AI Summary error:", error);
      setAiSummaryDialog((prev) => ({
        ...prev,
        summary: "Failed to generate summary. Please try again.",
        isGenerating: false,
      }));
    }
  };

  const closeAiSummaryDialog = () => {
    setAiSummaryDialog({
      isOpen: false,
      title: "",
      summary: "",
      authors: "",
      isGenerating: false,
    });
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "/login";
  };

  const getTitle = (item) => {
    if (Array.isArray(item.Title)) return item.Title[0] || "No Title";
    return item.Title || "No Title";
  };

  const getAuthors = (about) => {
    if (!about || !about.Authors) return "Unknown Authors";
    if (typeof about.Authors === "string") return about.Authors;
    if (Array.isArray(about.Authors)) {
      if (about.Authors.length === 0) return "No Authors";
      if (typeof about.Authors[0] === "object") {
        return about.Authors.map((a) =>
          `${a.given || ""} ${a.family || ""}`.trim(),
        )
          .filter((n) => n)
          .join(", ");
      }
      return about.Authors.join(", ");
    }
    return "Unknown Authors";
  };

  // Get authors in citation format: Last, F., Last, F., & Last, F.
  const getAuthorsForCitation = (about) => {
    if (!about || !about.Authors) return "Unknown Authors";

    if (typeof about.Authors === "string") {
      return about.Authors;
    }

    if (Array.isArray(about.Authors)) {
      if (about.Authors.length === 0) return "Unknown Authors";

      if (typeof about.Authors[0] === "object") {
        const authorsList = about.Authors.map((author) => {
          const family = author.family || "";
          const given = author.given || "";
          const initials = given
            .split(" ")
            .map((name) => name.charAt(0) + ".")
            .join(" ");
          return `${family}, ${initials}`.trim();
        });

        if (authorsList.length === 1) {
          return authorsList[0];
        } else if (authorsList.length === 2) {
          return `${authorsList[0]} & ${authorsList[1]}`;
        } else {
          const lastAuthor = authorsList.pop();
          return `${authorsList.join(", ")}, & ${lastAuthor}`;
        }
      }

      // If it's an array of strings
      if (about.Authors.length === 1) return about.Authors[0];
      if (about.Authors.length === 2)
        return `${about.Authors[0]} & ${about.Authors[1]}`;
      const lastAuthor = about.Authors.pop();
      return `${about.Authors.join(", ")}, & ${lastAuthor}`;
    }

    return "Unknown Authors";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      if (typeof dateString === "string" && dateString.includes("T")) {
        return new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      if (dateString["date-parts"]) {
        const [year, month, day] = dateString["date-parts"][0];
        return new Date(year, month - 1, day).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />");
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // Save paper to library
  const saveToLibrary = async (paper) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        alert("Please login to save papers");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/save-paper/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: authToken,
          paperData: paper,
        }),
      });

      if (response.ok) {
        alert("Paper saved to your library!");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div className="dashboard-split-container dark-theme">
      {/* Left Panel - Search & Filters */}
      <div className="left-panel">
        <div className="left-header">
          <div className="brand">
            <i className="fas fa-graduation-cap"></i>
            <span>ScholarCite</span>
          </div>

          <div className="user-menu">
            <button
              className="user-toggle"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {profile.profilePic ? (
                <img src={profile.profilePic} alt={profile.name} />
              ) : (
                <i className="fas fa-user-circle"></i>
              )}
              <span>{profile.name.split(" ")[0]}</span>
              <i
                className={`fas fa-chevron-${showUserMenu ? "up" : "down"}`}
              ></i>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-user-info">
                  {profile.profilePic ? (
                    <img src={profile.profilePic} alt={profile.name} />
                  ) : (
                    <i className="fas fa-user-circle"></i>
                  )}
                  <div>
                    <p className="name">{profile.name}</p>
                    <p className="email">{profile.email}</p>
                  </div>
                </div>

                <button
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="search-section">
          <div className="search-header">
            <h1>Discover Research Papers</h1>
            <p>Search millions of academic papers instantly</p>
          </div>

          <form className="search-form" onSubmit={handleSearchSubmit}>
            <div className="search-box">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Enter title, author, keyword, DOI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="search-btn"
                disabled={isSearching}
              >
                {isSearching ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-arrow-right"></i>
                )}
              </button>
            </div>
          </form>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="filter-header">
              <h3>
                <i className="fas fa-filter"></i> Filters
              </h3>
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
                disabled={isSearching}
              >
                Clear All
              </button>
            </div>

            {/* Search Type Filter */}
            <div className="filter-group">
              {/* <label className="filter-label">
                <i className="fas fa-search"></i>
                <span>Search In</span>
              </label>
              <div className="filter-options">
                {['all', 'title', 'abstract'].map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`filter-option ${filters.searchType === type ? 'active' : ''}`}
                    onClick={() => {
                      handleFilterChange('searchType', type);
                      applyFiltersAndSearch();
                    }}
                    disabled={isSearching}
                  >
                    {type === 'all' ? 'All Fields' : 
                     type === 'title' ? 'Title Only' : 
                     'Abstract Only'}
                  </button>
                ))}
              </div> */}
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <i className="fas fa-list-ol"></i>
                <span>Results per page</span>
              </label>
              <div className="filter-options">
                {[10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`filter-option ${filters.resultCount === num ? "active" : ""}`}
                    onClick={() => {
                      handleFilterChange("resultCount", num);
                      applyFiltersAndSearch();
                    }}
                    disabled={isSearching}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Range Filter */}
            <div className="filter-group">
              <label className="filter-label">
                <i className="fas fa-calendar-alt"></i>
                <span>Publication Year Range</span>
              </label>
              <div className="year-range-filter">
                <div className="date-input-group">
                  <label>From</label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) =>
                      handleFilterChange("fromDate", e.target.value)
                    }
                    max={new Date().toISOString().split("T")[0]}
                    disabled={isSearching}
                  />
                </div>
                <div className="date-input-group">
                  <label>To</label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) =>
                      handleFilterChange("toDate", e.target.value)
                    }
                    max={new Date().toISOString().split("T")[0]}
                    min={filters.fromDate}
                    disabled={isSearching}
                  />
                </div>
                <button
                  type="button"
                  className="apply-filter-btn"
                  onClick={applyFiltersAndSearch}
                  disabled={isSearching}
                >
                  Apply Date Range
                </button>
              </div>
            </div>

            {/* Single Year Filter */}
            {/* <div className="filter-group">
              <label className="filter-label">
                <i className="fas fa-calendar"></i>
                <span>Specific Year</span>
              </label>
              <div className="year-filter">
                <input
                  type="number"
                  placeholder="e.g., 2023"
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  min="1900"
                  max={new Date().getFullYear()}
                  disabled={isSearching}
                />
                <button 
                  type="button"
                  className="apply-filter-btn"
                  onClick={applyFiltersAndSearch}
                  disabled={isSearching}
                >
                  Apply Year
                </button>
              </div>
            </div> */}

            {/* Sort Options */}
            <div className="filter-group">
              <label className="filter-label">
                <i className="fas fa-sort-amount-down"></i>
                <span>Sort by</span>
              </label>
              <div className="sort-options">
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    handleFilterChange("sortBy", e.target.value);
                    applyFiltersAndSearch();
                  }}
                  disabled={isSearching}
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Most Recent</option>
                </select>
                <button
                  type="button"
                  className={`sort-order-btn ${filters.sortOrder}`}
                  onClick={() => {
                    const newOrder =
                      filters.sortOrder === "desc" ? "asc" : "desc";
                    handleFilterChange("sortOrder", newOrder);
                    applyFiltersAndSearch();
                  }}
                  disabled={isSearching}
                >
                  <i
                    className={`fas fa-sort-amount-${filters.sortOrder === "desc" ? "down" : "up"}`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Open Access Filter */}
            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.openAccess}
                  onChange={(e) => {
                    handleFilterChange("openAccess", e.target.checked);
                    applyFiltersAndSearch();
                  }}
                  disabled={isSearching}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">
                  <i className="fas fa-unlock"></i>
                  Open Access Only
                </span>
              </label>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-database"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">50M+</span>
                <span className="stat-label">Research Papers</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-university"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">10K+</span>
                <span className="stat-label">Universities</span>
              </div>
            </div>
          </div>

          {/* User Profile Summary */}
          <div className="profile-summary">
            <div className="profile-header">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt={profile.name}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar">
                  <i className="fas fa-user"></i>
                </div>
              )}
              <div className="profile-info">
                <h4>{profile.name}</h4>
                <p>{profile.field}</p>
              </div>
            </div>
            <div className="profile-details">
              <div className="detail-item">
                <i className="fas fa-university"></i>
                <span>{profile.institution}</span>
              </div>
              <div className="detail-item">
                <i className="fas fa-envelope"></i>
                <span>{profile.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="right-panel">
        {!hasSearched ? (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-icon">
                <i className="fas fa-search"></i>
              </div>
              <h2>Welcome to ScholarCite</h2>
              <p className="welcome-subtitle">
                Start your research journey by entering keywords, titles, or
                authors in the search box.
              </p>

              <div className="welcome-features">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <h3>Fast Search</h3>
                  <p>Search across millions of papers in seconds</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                  <h3>AI Summaries</h3>
                  <p>Get instant AI-powered paper summaries</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-filter"></i>
                  </div>
                  <h3>Smart Filters</h3>
                  <p>Refine results with advanced filters</p>
                </div>
              </div>

              <div className="recent-searches">
                <h3>Try searching for:</h3>
                <div className="search-suggestions">
                  <button
                    className="suggestion-tag"
                    onClick={() => {
                      setSearchQuery("machine learning");
                      performSearch("machine learning");
                    }}
                  >
                    machine learning
                  </button>
                  <button
                    className="suggestion-tag"
                    onClick={() => {
                      setSearchQuery("quantum computing");
                      performSearch("quantum computing");
                    }}
                  >
                    quantum computing
                  </button>
                  <button
                    className="suggestion-tag"
                    onClick={() => {
                      setSearchQuery("covid-19 vaccine");
                      performSearch("covid-19 vaccine");
                    }}
                  >
                    covid-19 vaccine
                  </button>
                  <button
                    className="suggestion-tag"
                    onClick={() => {
                      setSearchQuery("climate change");
                      performSearch("climate change");
                    }}
                  >
                    climate change
                  </button>
                  <button
                    className="suggestion-tag"
                    onClick={() => {
                      setSearchQuery("artificial intelligence");
                      performSearch("artificial intelligence");
                    }}
                  >
                    artificial intelligence
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="results-container">
            <div className="results-header">
              <div className="header-left">
                <h3>
                  Search Results
                  {searchResults.length > 0 && (
                    <span className="results-count">
                      {" "}
                      • {searchResults.length} papers
                    </span>
                  )}
                </h3>
                <p className="search-query">
                  <i className="fas fa-search"></i> "{searchQuery}"
                  {filters.fromDate && filters.toDate && (
                    <span className="date-range-indicator">
                      • From {new Date(filters.fromDate).toLocaleDateString()}{" "}
                      to {new Date(filters.toDate).toLocaleDateString()}
                    </span>
                  )}
                  {filters.year && (
                    <span className="year-indicator">
                      • Year: {filters.year}
                    </span>
                  )}
                </p>
              </div>
              <div className="header-right">
                <div className="results-stats">
                  <i className="fas fa-filter"></i>
                  <span>
                    Filters: {filters.resultCount} results •{" "}
                    {filters.searchType} • {filters.year || "Any year"} •{" "}
                    {filters.sortBy}
                  </span>
                </div>
                <div className="header-actions">
                  <button
                    className="action-btn refresh-btn"
                    onClick={() => performSearch()}
                    disabled={isSearching}
                  >
                    <i className="fas fa-redo"></i>
                    Refresh
                  </button>
                  {/* <button 
                    className="action-btn export-btn"
                    onClick={() => alert('Export feature coming soon!')}
                  >
                    <i className="fas fa-download"></i>
                    Export
                  </button> */}
                </div>
              </div>
            </div>

            {isSearching ? (
              <div className="loading-state">
                <div className="loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
                <h3>Searching Academic Databases</h3>
                <p className="loading-subtext">
                  Scanning arXiv, PubMed, CrossRef and more...
                </p>
                <div className="loading-progress">
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">
                  <i className="fas fa-search-minus"></i>
                </div>
                <h3>No papers found</h3>
                <p>Try adjusting your search terms or filters</p>
                <div className="no-results-actions">
                  <button className="btn btn-primary" onClick={clearFilters}>
                    Clear All Filters
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setHasSearched(false)}
                  >
                    Back to Search
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="results-summary">
                  <p>
                    Found <strong>{searchResults.length}</strong> papers
                    matching your search.
                    {filters.year && ` Published in ${filters.year}.`}
                    {filters.fromDate &&
                      filters.toDate &&
                      ` Published between ${new Date(filters.fromDate).toLocaleDateString()} and ${new Date(filters.toDate).toLocaleDateString()}.`}
                    {filters.searchType !== "all" &&
                      ` Searching in ${filters.searchType} only.`}
                  </p>
                </div>
                <div className="results-list">
                  {searchResults.map((result, index) => (
                    <div key={index} className="paper-card">
                      <div className="paper-header">
                        <div className="paper-title-section">
                          <div className="paper-badge">
                            <i className="fas fa-file-alt"></i>
                            Research Paper
                          </div>
                          <h4>{getTitle(result)}</h4>
                          <div className="paper-meta">
                            <span className="meta-item">
                              <i className="fas fa-calendar"></i>
                              {formatDate(result.about?.["Published "]) ||
                                "Unknown date"}
                            </span>
                            {result.about?.citation_count && (
                              <span className="meta-item">
                                <i className="fas fa-quote-right"></i>
                                {result.about.citation_count} citations
                              </span>
                            )}
                            {result.about?.DOI && (
                              <span className="meta-item">
                                <i className="fas fa-fingerprint"></i>
                                DOI: {result.about.DOI.substring(0, 20)}...
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="paper-actions-header">
                          {result.about?.PDF_URL && (
                            <a
                              href={result.about.PDF_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pdf-link"
                            >
                              <i className="fas fa-external-link-alt"></i> Open
                              PDF
                            </a>
                          )}
                          {/* <button 
                            className="save-btn"
                            onClick={() => saveToLibrary(result)}
                            title="Save to library"
                          >
                            <i className="far fa-bookmark"></i>
                          </button> */}
                        </div>
                      </div>

                      <div className="paper-content">
                        <p className="authors">
                          <i className="fas fa-user-edit"></i>
                          <strong>Authors:</strong> {getAuthors(result.about)}
                        </p>

                        {result.about?.Summary &&
                          result.about.Summary !== "No Data About Abstract" && (
                            <div className="abstract-section">
                              <div className="abstract-header">
                                <i className="fas fa-align-left"></i>
                                <span>Abstract</span>
                              </div>
                              <div className="abstract-content">
                                <p>
                                  {expandedSummaries[index]
                                    ? result.about.Summary
                                    : `${result.about.Summary.substring(0, 350)}...`}
                                </p>
                                {result.about.Summary.length > 350 && (
                                  <button
                                    className="read-more-btn"
                                    onClick={() => toggleSummary(index)}
                                  >
                                    {expandedSummaries[index] ? (
                                      <>
                                        <i className="fas fa-chevron-up"></i>{" "}
                                        Show Less
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-chevron-down"></i>{" "}
                                        Read More
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                        {result.about?.Keywords && (
                          <div className="keywords-section">
                            <div className="keywords-header">
                              <i className="fas fa-tags"></i>
                              <span>Keywords</span>
                            </div>
                            <div className="keywords-list">
                              {Array.isArray(result.about.Keywords) ? (
                                result.about.Keywords.slice(0, 5).map(
                                  (keyword, idx) => (
                                    <span key={idx} className="keyword-tag">
                                      {keyword}
                                    </span>
                                  ),
                                )
                              ) : (
                                <span className="keyword-tag">
                                  {result.about.Keywords}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="paper-footer">
                        <div className="footer-actions">
                          {result.about?.PDF_URL && (
                            <a
                              href={result.about.PDF_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary"
                            >
                              <i className="fas fa-file-pdf"></i> View PDF
                            </a>
                          )}
                          <button
                            className="btn btn-secondary"
                            onClick={() => generateAISummary(result)}
                          >
                            <i className="fas fa-robot"></i> AI Summary
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleGenerateCitation(result)}
                          >
                            <i className="fas fa-quote-left"></i> Copy Citation
                          </button>
                          {/* <button 
                            className="btn btn-outline"
                            onClick={() => saveToLibrary(result)}
                          >
                            <i className="far fa-bookmark"></i> Save
                          </button> */}
                        </div>
                        <div className="paper-source">
                          {result.about?.source && (
                            <span className="source-tag">
                              <i className="fas fa-database"></i>{" "}
                              {result.about.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {searchResults.length > 0 && (
                  <div className="pagination">
                    <button className="pagination-btn disabled">
                      <i className="fas fa-chevron-left"></i> Previous
                    </button>
                    <span className="pagination-info">Page 1 of 1</span>
                    <button className="pagination-btn disabled">
                      Next <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* AI Summary Dialog */}
      {aiSummaryDialog.isOpen && (
        <div className="dialog-overlay">
          <div className="ai-dialog">
            <div className="dialog-header">
              <div className="dialog-title">
                <i className="fas fa-robot"></i>
                <h3>AI-Powered Summary</h3>
              </div>
              <button onClick={closeAiSummaryDialog} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="dialog-body">
              <div className="dialog-paper-info">
                <h4>{aiSummaryDialog.title}</h4>
                <p className="dialog-authors">
                  <i className="fas fa-user-edit"></i> {aiSummaryDialog.authors}
                </p>
              </div>
              <div className="summary-content">
                {aiSummaryDialog.isGenerating ? (
                  <div className="generating">
                    <div className="generating-spinner">
                      <i className="fas fa-spinner fa-spin"></i>
                    </div>
                    <h4>Generating Summary</h4>
                    <p className="generating-subtext">
                      Our AI is analyzing the paper and creating a comprehensive
                      summary...
                    </p>
                  </div>
                ) : (
                  <div className="dialog-summary">
                    <div className="summary-header">
                      <h5>Key Insights:</h5>
                    </div>
                    <div className="summary-text">
                      {renderFormattedText(aiSummaryDialog.summary)}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="dialog-footer">
              <button
                onClick={closeAiSummaryDialog}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  navigator.clipboard.writeText(aiSummaryDialog.summary);
                  alert("Summary copied to clipboard!");
                }}
              >
                <i className="far fa-copy"></i> Copy Summary
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => alert("Save feature coming soon!")}
              >
                <i className="far fa-save"></i> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Citation Dialog */}
      {citationDialog.isOpen && (
        <div className="dialog-overlay">
          <div className="citation-dialog">
            <div className="dialog-header">
              <div className="dialog-title">
                <i className="fas fa-quote-left"></i>
                <h3>Copy Citation</h3>
              </div>
              <button onClick={closeCitationDialog} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="dialog-body">
              <div className="citation-preview">
                <div className="citation-header">
                  <h4>APA Citation Format</h4>
                  <p className="citation-format-info">
                    <i className="fas fa-info-circle"></i> This citation follows
                    APA 7th edition format
                  </p>
                </div>
                <div className="citation-text-box">
                  <pre>{citationDialog.formattedCitation}</pre>
                </div>
                <div className="citation-instructions">
                  <p>
                    <i className="fas fa-lightbulb"></i>{" "}
                    <strong>How to use:</strong> Copy and paste this citation
                    into your reference list
                  </p>
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button onClick={closeCitationDialog} className="btn btn-outline">
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={copyCitationToClipboard}
              >
                <i className="far fa-copy"></i> Copy Citation
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const blob = new Blob([citationDialog.formattedCitation], {
                    type: "text/plain",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "citation.txt";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <i className="fas fa-download"></i> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="dialog-overlay">
          <div className="confirm-dialog">
            <div className="dialog-header">
              <div className="dialog-title">
                <i className="fas fa-sign-out-alt"></i>
                <h3>Confirm Logout</h3>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="close-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="dialog-body">
              <div className="logout-message">
                <div className="logout-icon">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <p>Are you sure you want to log out?</p>
                <p className="logout-subtext">
                  You'll need to sign in again to access your saved papers and
                  history.
                </p>
              </div>
            </div>
            <div className="dialog-footer">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button onClick={confirmLogout} className="btn btn-danger">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
