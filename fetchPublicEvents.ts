/**
 * Public Events Fetch Script for Tixoraa Platform
 * 
 * This enhanced script fetches public events from Eventbrite API exclusively
 * and stores them in the external_events table, with nationwide coverage
 * across all 50 US states and advanced filtering.
 * 
 * Key features:
 * - IMPORTANT: Uses Eventbrite as the exclusive source for public events
 * - Pulls events from all 50 US states using batch state-by-state search approach
 * - Only includes events scheduled within the next 14 days
 * - Focuses exclusively on fun/social events (music, food, arts, networking, etc.)
 * - Filters out political events, protests, and other non-social content
 * - Avoids inserting duplicates through external ID + source deduplication
 * - Automatically deletes events that are more than 2 weeks past their end date
 * - Implements rate limiting to respect Eventbrite API quotas
 * - Enhanced error handling and logging for troubleshooting
 * 
 * Run this script via cron job every 12 hours to keep events fresh.
 */

import { syncAllExternalEvents } from '../server/external-events';
import { storage } from '../server/storage';
import 'dotenv/config';
import { db } from '../server/db';
import { externalEvents } from '../shared/schema';
import { lt, and, eq } from 'drizzle-orm';
import { initializeExternalEventServices } from '../server/external-events';

/**
 * The main function to fetch and process public events from Eventbrite
 * This function handles the entire workflow of:
 * 1. Fetching fresh events from all 50 US states using batch state-by-state approach
 * 2. Cleaning up old events and filtering out non-social content
 * 3. Categorizing events and logging detailed statistics
 * 
 * This implementation supports the full 50-state coverage requirement and respects
 * API rate limits while ensuring maximum event discovery across the entire US.
 */
async function fetchPublicEvents() {
  console.log('Starting nationwide public events fetch across all 50 US states...');
  console.log(`Current timestamp: ${new Date().toISOString()}`);
  
  // Record start time for performance tracking
  const startTime = Date.now();
  
  try {
    // Initialize external event services if needed
    initializeExternalEventServices();
    
    // Step 1: Fetch new events from external sources (nationwide across all 50 states)
    console.log('Fetching events from all 50 US states using batch state-by-state approach...');
    // This will trigger our enhanced implementation that searches across all 50 states
    await syncAllExternalEvents();
    console.log('Successfully fetched events from all 50 US states');
    
    // Step 2: Enhanced cleanup - delete events that are:
    // - More than 2 weeks past their event date
    // - Any events with excluded keywords that might have slipped through
    console.log('Starting event cleanup process...');
    
    // Remove old events
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    // Delete events where end date is more than 2 weeks in the past
    const deletedPastEvents = await db.delete(externalEvents)
      .where(lt(externalEvents.endDate, twoWeeksAgo))
      .returning({ id: externalEvents.id });
    
    console.log(`Deleted ${deletedPastEvents.length} past events`);
    
    // Additional cleanup: Remove any events with excluded keywords in title or description
    const excludedKeywords = ['protest', 'rally', 'political', 'politics', 'election', 'candidate', 
                            'debate', 'campaign', 'referendum', 'ballot'];
    
    // For each excluded keyword, find and remove matching events
    let totalRemovedKeywordEvents = 0;
    
    for (const keyword of excludedKeywords) {
      // Delete events with keyword in title
      const removedFromTitle = await db.delete(externalEvents)
        .where(and(
          eq(externalEvents.source, 'eventbrite'),
          db.sql`lower(${externalEvents.title}) like ${'%' + keyword.toLowerCase() + '%'}`
        ))
        .returning({ id: externalEvents.id });
      
      // We can't easily search text fields in description this way, so we'll use a different approach
      const eventsWithKeywordInDesc = await db.query.externalEvents.findMany({
        where: and(
          eq(externalEvents.source, 'eventbrite'),
          db.sql`lower(${externalEvents.description}) like ${'%' + keyword.toLowerCase() + '%'}`
        ),
        columns: { id: true }
      });
      
      // Delete these events if any found
      let removedFromDesc: any[] = [];
      if (eventsWithKeywordInDesc.length > 0) {
        const idsToDelete = eventsWithKeywordInDesc.map(e => e.id);
        removedFromDesc = await db.delete(externalEvents)
          .where(eq(externalEvents.id, idsToDelete[0])) // Delete one by one for safety
          .returning({ id: externalEvents.id });
      }
      
      const removedForKeyword = removedFromTitle.length + removedFromDesc.length;
      if (removedForKeyword > 0) {
        console.log(`Removed ${removedForKeyword} events containing "${keyword}"`);
        totalRemovedKeywordEvents += removedForKeyword;
      }
    }
    
    console.log(`Total events removed by content filtering: ${totalRemovedKeywordEvents}`);
    
    // Step 3: Print statistics about current event availability
    const currentEvents = await db.query.externalEvents.findMany({
      where: eq(externalEvents.source, 'eventbrite'),
    });
    
    // Get counts per state and category
    const stateMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();
    
    currentEvents.forEach(event => {
      // Count by state
      const state = event.state || 'Unknown';
      stateMap.set(state, (stateMap.get(state) || 0) + 1);
      
      // Count by category
      const category = event.category || 'Other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    
    console.log(`Current event counts by state:`);
    for (const [state, count] of stateMap.entries()) {
      console.log(`  - ${state}: ${count} events`);
    }
    
    console.log(`Current event counts by category:`);
    for (const [category, count] of categoryMap.entries()) {
      console.log(`  - ${category}: ${count} events`);
    }
    
    // Calculate execution time
    const executionTime = (Date.now() - startTime) / 1000;
    console.log(`Public events fetch and cleanup completed successfully in ${executionTime.toFixed(2)} seconds`);
    console.log(`Total events in database: ${currentEvents.length}`);
    
  } catch (error) {
    console.error('Error in public events fetch process:', error);
    process.exit(1);
  }
}

// In ESM modules we don't have require.main, so we'll just execute it directly
// when the script is run
fetchPublicEvents()
  .then(() => {
    console.log('Public events fetch job completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error in public events fetch job:', error);
    process.exit(1);
  });

export { fetchPublicEvents };