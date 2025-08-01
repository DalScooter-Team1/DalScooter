import React from 'react';
import type { Bike, Feedback, SentimentFilter } from './types';

interface ReviewsSectionProps {
  feedbacks: Feedback[];
  selectedSentiment: SentimentFilter;
  setSelectedSentiment: (sentiment: SentimentFilter) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  feedbacks,
  selectedSentiment,
  setSelectedSentiment
}) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'mixed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      case 'mixed': return '🤔';
      default: return '😐';
    }
  };

  const getFilteredFeedbacks = () => {
    if (selectedSentiment === 'all') return feedbacks;
    return feedbacks.filter(feedback => feedback.sentiment === selectedSentiment);
  };

  const getFeedbackStats = () => {
    const total = feedbacks.length;
    const positive = feedbacks.filter(f => f.sentiment === 'positive').length;
    const neutral = feedbacks.filter(f => f.sentiment === 'neutral').length;
    const negative = feedbacks.filter(f => f.sentiment === 'negative').length;
    const mixed = feedbacks.filter(f => f.sentiment === 'mixed').length;
    
    return { total, positive, neutral, negative, mixed };
  };

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    return (totalRating / feedbacks.length).toFixed(1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Customer Reviews</h2>
              <p className="text-indigo-100 font-medium">See what our riders are saying</p>
            </div>
            {feedbacks.length > 0 && (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.floor(Number(getAverageRating())) ? 'text-yellow-300' : 'text-white text-opacity-30'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{getAverageRating()}</div>
                    <div className="text-indigo-100 text-sm font-medium">{feedbacks.length} reviews</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Enhanced Feedback Statistics with Pie Chart */}
        {feedbacks.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Sentiment Distribution
                </h3>
                <div className="relative w-48 h-48">
                  {(() => {
                    const stats = getFeedbackStats();
                    const total = stats.total;
                    
                    if (total === 0) return (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <div className="text-2xl text-gray-400 mb-1">📊</div>
                          <div className="text-sm text-gray-500">No data</div>
                        </div>
                      </div>
                    );
                    
                    const positivePercent = (stats.positive / total) * 100;
                    const neutralPercent = (stats.neutral / total) * 100;
                    const negativePercent = (stats.negative / total) * 100;
                    const mixedPercent = (stats.mixed / total) * 100;
                    
                    // Calculate cumulative percentages for pie chart
                    const positiveAngle = (positivePercent / 100) * 360;
                    const neutralAngle = (neutralPercent / 100) * 360;
                    const negativeAngle = (negativePercent / 100) * 360;
                    const mixedAngle = (mixedPercent / 100) * 360;
                    
                    let currentAngle = 0;
                    const radius = 96; // w-48 = 192px / 2 = 96px
                    const center = radius;
                    
                    const createPath = (percentage: number, startAngle: number) => {
                      if (percentage === 0) return '';
                      
                      const endAngle = startAngle + (percentage / 100) * 360;
                      const x1 = center + radius * Math.cos((startAngle - 90) * Math.PI / 180);
                      const y1 = center + radius * Math.sin((startAngle - 90) * Math.PI / 180);
                      const x2 = center + radius * Math.cos((endAngle - 90) * Math.PI / 180);
                      const y2 = center + radius * Math.sin((endAngle - 90) * Math.PI / 180);
                      
                      const largeArcFlag = percentage > 50 ? 1 : 0;
                      
                      return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                    };
                    
                    return (
                      <div className="relative">
                        <svg width="192" height="192" viewBox="0 0 192 192" className="transform -rotate-90 drop-shadow-sm">
                          {/* Positive */}
                          {stats.positive > 0 && (
                            <path
                              d={createPath(positivePercent, currentAngle)}
                              fill="#10b981"
                              className="hover:opacity-80 transition-all duration-300 cursor-pointer drop-shadow-sm"
                              onClick={() => setSelectedSentiment('positive')}
                            />
                          )}
                          
                          {/* Neutral */}
                          {stats.neutral > 0 && (
                            <path
                              d={createPath(neutralPercent, currentAngle + positiveAngle)}
                              fill="#6b7280"
                              className="hover:opacity-80 transition-all duration-300 cursor-pointer drop-shadow-sm"
                              onClick={() => setSelectedSentiment('neutral')}
                            />
                          )}
                          
                          {/* Negative */}
                          {stats.negative > 0 && (
                            <path
                              d={createPath(negativePercent, currentAngle + positiveAngle + neutralAngle)}
                              fill="#ef4444"
                              className="hover:opacity-80 transition-all duration-300 cursor-pointer drop-shadow-sm"
                              onClick={() => setSelectedSentiment('negative')}
                            />
                          )}
                          
                          {/* Mixed */}
                          {stats.mixed > 0 && (
                            <path
                              d={createPath(mixedPercent, currentAngle + positiveAngle + neutralAngle + negativeAngle)}
                              fill="#8b5cf6"
                              className="hover:opacity-80 transition-all duration-300 cursor-pointer drop-shadow-sm"
                              onClick={() => setSelectedSentiment('mixed')}
                            />
                          )}
                          
                          {/* Center circle for donut effect */}
                          <circle cx={center} cy={center} r="30" fill="white" className="drop-shadow-sm" />
                          
                          {/* Center text */}
                          <text x={center} y={center - 5} textAnchor="middle" className="text-sm font-bold fill-gray-900 transform rotate-90" style={{transformOrigin: `${center}px ${center}px`}}>
                            {total}
                          </text>
                          <text x={center} y={center + 15} textAnchor="middle" className="text-xs fill-gray-600 transform rotate-90" style={{transformOrigin: `${center}px ${center}px`}}>
                            Total
                          </text>
                        </svg>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Feedback Preview Window */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {selectedSentiment === 'all' ? 'All Reviews' : `${selectedSentiment.charAt(0).toUpperCase() + selectedSentiment.slice(1)} Reviews`}
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {getFilteredFeedbacks().length} review{getFilteredFeedbacks().length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {getFilteredFeedbacks().length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">
                        {selectedSentiment === 'all' 
                          ? 'No reviews yet' 
                          : `No ${selectedSentiment} reviews found`}
                      </p>
                    </div>
                  ) : (
                    getFilteredFeedbacks().slice(0, 5).map((feedback, index) => (
                      <div 
                        key={feedback.id} 
                        className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 transform hover:scale-102"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold text-sm">
                                {feedback.user.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {feedback.user}
                              </p>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentColor(feedback.sentiment)}`}>
                                  {feedback.sentiment}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2 italic">
                              "{feedback.comment}"
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {feedback.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {getFilteredFeedbacks().length > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-500">
                        Showing 5 of {getFilteredFeedbacks().length} reviews
                      </p>
                      <button
                        onClick={() => {
                          // Scroll to the full reviews section
                          const reviewsSection = document.querySelector('[data-reviews-section]');
                          if (reviewsSection) {
                            reviewsSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-1 transition-colors"
                      >
                        View all reviews
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
