# Trekka QA Checklist

## Testing / Acceptance Checklist

### Authentication & Onboarding

- [ ] **Sign up via magic link**
  - Navigate to /login
  - Enter email address
  - Click "Send magic link"
  - Check email for magic link
  - Click link in email
  - Should be redirected to /onboarding

- [ ] **Set username and profile**
  - Enter unique username (lowercase, 3-20 chars)
  - Upload avatar image
  - Add display name
  - Add occupation
  - Add bio (max 240 chars)
  - Add social links (Instagram, TikTok, LinkedIn, X, Website)
  - Click "Complete Setup"
  - Should redirect to /feed

### Trip Management

- [ ] **Create a trip with valid dates**
  - Navigate to /trips/new
  - Enter destination
  - Select start date
  - Select end date (must be >= start date)
  - Add description (optional)
  - Toggle private/public
  - Submit form
  - Should redirect to trip detail page
  - Trip appears on your profile under "Upcoming"

- [ ] **Trip date validation**
  - Try to create trip with end date before start date
  - Should show validation error

### Public Profile

- [ ] **Visit your public profile from incognito**
  - Copy your profile URL (/u/[username])
  - Open in incognito/private browsing
  - Should see public profile with:
    - Avatar, display name, username
    - Bio and occupation
    - Social links
    - Upcoming trips tab
    - Past trips tab
  - Private trips should NOT be visible

- [ ] **Profile link sharing**
  - Click "Copy Link" on profile
  - Should copy profile URL to clipboard
  - Should show success toast

### Social Features

- [ ] **Follow another user (Account B)**
  - Create second account
  - Visit first account's profile
  - Click "Follow" button
  - Button should change to "Unfollow"
  - First account's public trips should appear in Account B's /feed

- [ ] **Unfollow user**
  - Click "Unfollow" on followed user
  - Button should change back to "Follow"
  - User's trips should disappear from feed

### Trip Interest

- [ ] **Mark interest on trip (from Account B)**
  - Visit a trip created by Account A
  - Click "Interested" button
  - Count should increment
  - Account B's avatar should appear in interested list

- [ ] **Toggle interest status**
  - Click "Interested" button again
  - Should toggle to "not interested"
  - Count should decrement
  - Avatar should be removed from list

- [ ] **View interested users (as trip creator)**
  - Log in as trip creator
  - Visit your trip page
  - Should see list of interested users with:
    - User avatars
    - Usernames (clickable links to profiles)
    - Total count

### Calendar Export

- [ ] **Download ICS file**
  - Visit any trip page
  - Click "Add to Calendar" button
  - Should download .ics file
  - File name should be "trip-[id].ics"

- [ ] **Import to calendar app**
  - Open downloaded .ics file
  - Import into Google Calendar/Apple Calendar/Outlook
  - Event should appear with:
    - Title: "Trip: [destination]"
    - Dates matching trip dates
    - All-day event
    - Link back to trip page

### Feed

- [ ] **Feed shows followed users' trips**
  - Follow multiple users
  - Navigate to /feed
  - Should see upcoming public trips from followed users
  - Trips should be grouped by month
  - Sorted by start date (ascending)

- [ ] **Empty feed state**
  - Create new account with no follows
  - Navigate to /feed
  - Should see empty state message
  - Should have "Create Your First Trip" button

### Privacy

- [ ] **Private trips visibility**
  - Create private trip
  - Log out or use incognito
  - Visit your profile
  - Private trip should NOT be visible
  - Log back in
  - Private trip should be visible to you

### Mobile Responsiveness

- [ ] **Test on mobile viewport**
  - All pages should be mobile-friendly
  - Navigation should work
  - Forms should be usable
  - Cards should stack vertically
  - Buttons should be tap-friendly

### Error Handling

- [ ] **Username uniqueness**
  - Try to register with existing username
  - Should show "Username already taken" error

- [ ] **Invalid data handling**
  - Try to submit forms with invalid data
  - Should show appropriate validation messages
  - Forms should not submit

- [ ] **Authentication required**
  - Try to access /feed, /trips/new while logged out
  - Should redirect to /login

## Performance Checklist

- [ ] Images load quickly
- [ ] Page transitions are smooth
- [ ] Forms submit without lag
- [ ] Search/filter operations are responsive

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility

- [ ] Keyboard navigation works
- [ ] Form labels are present
- [ ] Buttons have appropriate text/aria-labels
- [ ] Color contrast is sufficient
- [ ] Images have alt text