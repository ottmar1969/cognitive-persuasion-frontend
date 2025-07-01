import React, { useState, useEffect } from 'react';

const RefinedTierSelector = ({ businessId, onConversationStart }) => {
  const [email, setEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState('tier1');
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchTiers();
  }, [email]);

  const fetchTiers = async () => {
    try {
      const response = await fetch(`/api/ai-conversations/tiers?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setTiers(data.tiers);
      setIsOwner(data.free_access || false);
    } catch (error) {
      console.error('Error fetching tiers:', error);
    }
  };

  const handleStartAnalysis = async () => {
    if (!businessId) {
      alert('Please select a business first');
      return;
    }

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/ai-conversations/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: businessId,
          tier: selectedTier,
          email: email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onConversationStart(data);
      } else if (response.status === 402) {
        // Payment required
        alert(`Payment required: $${data.price} for ${data.tier_name}`);
        // Here you would integrate with payment system
      } else {
        alert(data.error || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tierName) => {
    const icons = {
      'Complete Package': '🎁',
      'Extended Conversation': '💬',
      'Comprehensive Conversation': '🔍',
      'Executive Conversation': '👔',
      'Strategic Deep Dive': '🎯',
      'Ultimate Analysis': '🚀'
    };
    return icons[tierName] || '📈';
  };

  const getTierColor = (tierId) => {
    const colors = {
      'tier1': '#28a745',
      'tier2': '#17a2b8',
      'tier3': '#ffc107',
      'tier4': '#6f42c1',
      'tier5': '#fd7e14',
      'tier6': '#dc3545'
    };
    return colors[tierId] || '#6c757d';
  };

  const getTierFeatures = (tier) => {
    const baseFeatures = [
      `${tier.rounds} rounds of AI expert debate`,
      `${tier.messages} professional messages`,
      `~${tier.duration_minutes} minutes analysis`,
      'Public conversation (SEO optimized)',
      'Real-time AI expert discussion'
    ];

    if (tier.includes_publishing) {
      return [
        ...baseFeatures,
        '🎯 Professional SEO landing page',
        '📱 Social media content package',
        '🏢 Directory submissions (Google, Bing, Yelp)',
        '📊 Schema markup for search engines',
        '📈 Analytics and performance tracking',
        '🧠 Knowledge graph integration'
      ];
    }

    return baseFeatures;
  };

  return (
    <div className="refined-tier-selector">
      <style jsx>{`
        .refined-tier-selector {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .email-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          text-align: center;
        }

        .email-section h3 {
          margin: 0 0 20px 0;
          font-size: 1.5rem;
        }

        .email-input {
          width: 100%;
          max-width: 400px;
          padding: 15px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          margin: 10px 0;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .email-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
        }

        .owner-badge {
          background: linear-gradient(45deg, #28a745, #20c997);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: bold;
          margin-top: 15px;
          display: inline-block;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }

        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }

        .tier-card {
          background: white;
          border: 3px solid #e9ecef;
          border-radius: 20px;
          padding: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
        }

        .tier-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .tier-card.selected {
          border-color: #007bff;
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.25);
          transform: translateY(-5px);
        }

        .tier-card.tier1 {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
        }

        .tier-card.tier1 .tier-description,
        .tier-card.tier1 .tier-features li {
          color: rgba(255, 255, 255, 0.9);
        }

        .tier-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .tier-icon {
          font-size: 2.5rem;
          margin-right: 15px;
        }

        .tier-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
        }

        .tier-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #ff6b6b;
          color: white;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: bold;
          box-shadow: 0 2px 10px rgba(255, 107, 107, 0.3);
        }

        .tier-badge.complete {
          background: #28a745;
        }

        .tier-badge.popular {
          background: #4ecdc4;
        }

        .tier-badge.enterprise {
          background: #6c5ce7;
        }

        .tier-description {
          color: #6c757d;
          margin-bottom: 25px;
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .tier-features {
          list-style: none;
          padding: 0;
          margin: 25px 0;
        }

        .tier-features li {
          padding: 8px 0;
          color: #495057;
          position: relative;
          padding-left: 25px;
        }

        .tier-features li:before {
          content: '✓';
          color: #28a745;
          font-weight: bold;
          position: absolute;
          left: 0;
          top: 8px;
        }

        .tier1 .tier-features li:before {
          color: #fff;
        }

        .tier-pricing {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 25px;
          padding-top: 25px;
          border-top: 2px solid #e9ecef;
        }

        .tier1 .tier-pricing {
          border-top-color: rgba(255, 255, 255, 0.3);
        }

        .tier-price {
          font-size: 2.5rem;
          font-weight: bold;
          color: #007bff;
        }

        .tier1 .tier-price {
          color: #fff;
        }

        .tier-price.free {
          color: #28a745;
        }

        .tier1 .tier-price.free {
          color: #fff;
        }

        .tier-price.original {
          text-decoration: line-through;
          color: #6c757d;
          font-size: 1.3rem;
          margin-left: 15px;
        }

        .tier1 .tier-price.original {
          color: rgba(255, 255, 255, 0.7);
        }

        .tier-duration {
          color: #6c757d;
          font-size: 1rem;
          font-weight: 500;
        }

        .tier1 .tier-duration {
          color: rgba(255, 255, 255, 0.9);
        }

        .start-button {
          width: 100%;
          padding: 18px;
          background: linear-gradient(45deg, #007bff, #0056b3);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 25px;
          box-shadow: 0 5px 20px rgba(0, 123, 255, 0.3);
        }

        .start-button:hover {
          background: linear-gradient(45deg, #0056b3, #004085);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
        }

        .start-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s ease-in-out infinite;
          margin-right: 10px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .value-comparison {
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          border: 2px solid #bbdefb;
          border-radius: 15px;
          padding: 25px;
          margin-top: 25px;
          text-align: center;
        }

        .value-comparison h4 {
          color: #1976d2;
          margin: 0 0 15px 0;
        }

        .value-comparison p {
          color: #424242;
          margin: 10px 0;
          line-height: 1.6;
        }

        .public-notice {
          background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%);
          border: 2px solid #ffcc02;
          border-radius: 15px;
          padding: 20px;
          margin-top: 20px;
          text-align: center;
        }

        .public-notice h4 {
          color: #f57c00;
          margin: 0 0 10px 0;
        }

        .public-notice p {
          color: #5d4037;
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .tiers-grid {
            grid-template-columns: 1fr;
          }
          
          .tier-card {
            padding: 25px;
          }

          .tier-price {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="email-section">
        <h3>🚀 Start Your AI Business Analysis</h3>
        <input
          type="email"
          className="email-input"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {isOwner && (
          <div className="owner-badge">
            🎉 OWNER ACCESS - All Tiers FREE!
          </div>
        )}
      </div>

      <div className="tiers-grid">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`tier-card ${tier.id} ${selectedTier === tier.id ? 'selected' : ''}`}
            onClick={() => setSelectedTier(tier.id)}
          >
            {tier.id === 'tier1' && <div className="tier-badge complete">COMPLETE PACKAGE</div>}
            {tier.id === 'tier5' && <div className="tier-badge popular">MOST POPULAR</div>}
            {tier.id === 'tier6' && <div className="tier-badge enterprise">ENTERPRISE</div>}
            
            <div className="tier-header">
              <span className="tier-icon">{getTierIcon(tier.name)}</span>
              <h4 className="tier-title">{tier.name}</h4>
            </div>

            <p className="tier-description">{tier.description}</p>

            <ul className="tier-features">
              {getTierFeatures(tier).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            <div className="tier-pricing">
              <div>
                <span className={`tier-price ${tier.price === 0 ? 'free' : ''}`}>
                  {tier.price === 0 ? 'FREE' : `$${tier.price}`}
                </span>
                {tier.free_for_owner && tier.original_price > 0 && (
                  <span className="tier-price original">${tier.original_price}</span>
                )}
              </div>
              <div className="tier-duration">
                ~{tier.duration_minutes} min
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="start-button"
        onClick={handleStartAnalysis}
        disabled={loading || !email || !businessId}
      >
        {loading && <span className="loading-spinner"></span>}
        {loading ? 'Starting Analysis...' : `Start ${tiers.find(t => t.id === selectedTier)?.name || 'Analysis'}`}
      </button>

      <div className="public-notice">
        <h4>🌐 All Conversations Are Public</h4>
        <p>
          Your AI business analysis will be publicly accessible, contributing to AI training data 
          and providing SEO benefits for your business. This public approach maximizes the impact 
          and reach of your business insights.
        </p>
      </div>

      {!isOwner && (
        <div className="value-comparison">
          <h4>💰 Incredible Value Comparison</h4>
          <p><strong>Tier 1 Complete Package ($10):</strong> Includes everything competitors charge $299/month for!</p>
          <p><strong>Tier 6 Ultimate Analysis ($250):</strong> Delivers insights worth $100,000+ from traditional consultants!</p>
          <p><strong>All tiers:</strong> Provide genuinely different, non-repetitive AI conversations with progressive depth.</p>
        </div>
      )}
    </div>
  );
};

export default RefinedTierSelector;

