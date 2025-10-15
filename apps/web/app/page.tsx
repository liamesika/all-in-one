// Root homepage - Import and render the marketing page directly
// We can't use re-exports due to Next.js client manifest issues
import MarketingHomePage from './(marketing)/page';

// Re-export metadata separately
export { metadata } from './(marketing)/page';

export default MarketingHomePage;
