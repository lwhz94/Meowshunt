# 🧪 QA Checklist - Meowshunt

## 📋 **Pre-Testing Setup**

### **Environment Requirements**
- [ ] Supabase project configured and accessible
- [ ] Database seeded with sample data (`npm run seed`)
- [ ] Environment variables properly set
- [ ] Development server running (`npm run dev`)
- [ ] Test accounts created (admin + regular user)

---

## 🔐 **Authentication & User Management**

### **User Registration**
- [ ] New user can register with valid email/password
- [ ] Registration creates profile with default values
- [ ] User gets starter equipment automatically
- [ ] Registration redirects to dashboard/camp
- [ ] Duplicate email shows appropriate error
- [ ] Invalid email format shows validation error
- [ ] Password requirements enforced (if any)

### **User Login**
- [ ] Existing user can log in with correct credentials
- [ ] Login redirects to intended page
- [ ] Invalid credentials show appropriate error
- [ ] Session persists across page refreshes
- [ ] Logout clears session and redirects to home

### **Profile Management**
- [ ] User profile loads with correct data
- [ ] Energy regeneration works correctly
- [ ] Rank progression displays properly
- [ ] Gold balance updates correctly
- [ ] Experience points accumulate properly

---

## 🧭 **Navigation & Routing**

### **Main Navigation**
- [ ] Bottom navigation bar displays correctly
- [ ] All navigation items are accessible
- [ ] Current page is highlighted
- [ ] Navigation works on all screen sizes
- [ ] Deep linking works (direct URL access)

### **Page Transitions**
- [ ] Page loads without errors
- [ ] Loading states display properly
- [ ] Error boundaries catch and display errors
- [ ] Back/forward browser navigation works
- [ ] Page refresh maintains user state

### **Route Protection**
- [ ] Protected routes redirect unauthenticated users
- [ ] Admin routes require admin privileges
- [ ] User-specific data is properly isolated
- [ ] 404 page displays for invalid routes

---

## 🛍️ **Shop System**

### **Item Display**
- [ ] Shop items load correctly
- [ ] Item details display properly (name, price, rarity, description)
- [ ] Item images load (if present)
- [ ] Item filtering/sorting works (if implemented)
- [ ] Item categories display correctly

### **Purchase Flow**
- [ ] User can select item quantity
- [ ] Total price calculates correctly
- [ ] Purchase confirmation dialog works
- [ ] Purchase succeeds with sufficient gold
- [ ] Purchase fails with insufficient gold
- [ ] Error messages display appropriately
- [ ] Success feedback shows correctly

### **Post-Purchase**
- [ ] User's gold balance updates
- [ ] Item appears in inventory
- [ ] Purchase history updates (if implemented)
- [ ] Receipt/confirmation displays

---

## ⚔️ **Equipment Management**

### **Equipment Display**
- [ ] Current equipment shows correctly
- [ ] Equipment stats display properly
- [ ] Equipment images load (if present)
- [ ] Equipment rarity is visually distinct

### **Equipment Changes**
- [ ] User can equip different items
- [ ] Equipment changes persist across sessions
- [ ] Equipment requirements are enforced
- [ ] Equipment bonuses apply correctly
- [ ] Equipment affects hunting success rate

### **Equipment Validation**
- [ ] Invalid equipment combinations are prevented
- [ ] Equipment requirements are checked
- [ ] Equipment changes update hunting stats

---

## 🎯 **Hunting System**

### **Hunt Preparation**
- [ ] Hunt button is enabled with proper equipment
- [ ] Hunt button is disabled without equipment
- [ ] Energy requirement is enforced
- [ ] Equipment requirements are checked
- [ ] Hunt cost displays correctly

### **Hunt Execution**
- [ ] Hunt button responds to clicks
- [ ] Loading state displays during hunt
- [ ] Hunt consumes energy correctly
- [ ] Hunt consumes bait correctly
- [ ] Hunt API call succeeds

### **Hunt Results**
- [ ] Success results display correctly
- [ ] Miss results display correctly
- [ ] Rewards are calculated properly
- [ ] Experience points are awarded
- [ ] Gold is awarded (on success)
- [ ] Meow collection updates
- [ ] Result modal displays properly

### **Hunt Failure Scenarios**
- [ ] Insufficient energy shows appropriate error
- [ ] Missing equipment shows appropriate error
- [ ] Network errors are handled gracefully
- [ ] Rate limiting works (if implemented)

---

## 🏆 **Progression System**

### **Experience & Ranking**
- [ ] Experience points accumulate correctly
- [ ] Rank progression works at thresholds
- [ ] New rank unlocks display properly
- [ ] Rank benefits apply correctly
- [ ] Rank display updates in real-time

### **Collection Updates**
- [ ] New meows are added to collection
- [ ] Collection displays all caught meows
- [ ] Collection statistics are accurate
- [ ] Collection sorting/filtering works
- [ ] Duplicate meows are handled correctly

### **Location Unlocks**
- [ ] New locations unlock at proper ranks
- [ ] Location requirements are displayed
- [ ] Location access is properly restricted
- [ ] Location descriptions are accurate

---

## 🔒 **Security & RLS (Row Level Security)**

### **Data Isolation**
- [ ] Users can only see their own data
- [ ] Users cannot access other users' profiles
- [ ] Users cannot modify other users' data
- [ ] Admin users have appropriate access
- [ ] API endpoints enforce user authentication

### **Permission Checks**
- [ ] Profile data is user-specific
- [ ] Inventory is user-specific
- [ ] Equipment is user-specific
- [ ] Collections are user-specific
- [ ] Admin functions require admin role

### **API Security**
- [ ] `/api/hunt` requires authentication
- [ ] `/api/admin/*` requires admin role
- [ ] User ID validation works correctly
- [ ] SQL injection is prevented
- [ ] Rate limiting works (if implemented)

---

## 📱 **Mobile Responsiveness**

### **iOS Safari Testing**
- [ ] App loads without errors
- [ ] Navigation works properly
- [ ] Touch interactions respond correctly
- [ ] Forms work properly
- [ ] Modals display correctly
- [ ] Bottom navigation is accessible
- [ ] Text is readable
- [ ] Buttons are appropriately sized

### **Android Chrome Testing**
- [ ] App loads without errors
- [ ] Navigation works properly
- [ ] Touch interactions respond correctly
- [ ] Forms work properly
- [ ] Modals display correctly
- [ ] Bottom navigation is accessible
- [ ] Text is readable
- [ ] Buttons are appropriately sized

### **Responsive Design**
- [ ] Layout adapts to different screen sizes
- [ ] Content is properly scaled
- [ ] Navigation remains accessible
- [ ] Forms are usable on small screens
- [ ] Images scale appropriately

---

## ♿ **Accessibility Testing**

### **Keyboard Navigation**
- [ ] Tab order is logical and intuitive
- [ ] All interactive elements are focusable
- [ ] Focus indicators are visible
- [ ] Keyboard shortcuts work (if implemented)
- [ ] Skip links work (if implemented)

### **Screen Reader Support**
- [ ] ARIA labels are present and accurate
- [ ] ARIA descriptions provide context
- [ ] Form labels are properly associated
- [ ] Error messages are announced
- [ ] Status updates are announced

### **Visual Accessibility**
- [ ] Color contrast meets WCAG standards
- [ ] Text is readable at different sizes
- [ ] Icons have text alternatives
- [ ] Error states are visually distinct
- [ ] Success states are visually distinct

### **Content Accessibility**
- [ ] Headings are properly structured
- [ ] Lists are properly marked up
- [ ] Tables are accessible (if present)
- [ ] Images have alt text
- [ ] Links have descriptive text

---

## 🧪 **Edge Cases & Error Handling**

### **Network Issues**
- [ ] Offline state is handled gracefully
- [ ] Network errors show appropriate messages
- [ ] Retry mechanisms work (if implemented)
- [ ] Loading states are displayed

### **Data Validation**
- [ ] Invalid input is rejected
- [ ] Error messages are helpful
- [ ] Form validation works
- [ ] Data sanitization prevents issues

### **Performance**
- [ ] Pages load within acceptable time
- [ ] Animations are smooth
- [ ] Large datasets don't crash the app
- [ ] Memory usage is reasonable

---

## 📊 **Testing Results Summary**

### **Test Coverage**
- **Total Test Cases:** [ ] / [ ]
- **Passed:** [ ] / [ ]
- **Failed:** [ ] / [ ]
- **Skipped:** [ ] / [ ]

### **Critical Issues Found**
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________
- [ ] Issue 3: ________________

### **Minor Issues Found**
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________
- [ ] Issue 3: ________________

### **Recommendations**
- [ ] Recommendation 1: ________________
- [ ] Recommendation 2: ________________
- [ ] Recommendation 3: ________________

---

## 🔄 **Retest After Fixes**
- [ ] Critical issues have been resolved
- [ ] Minor issues have been addressed
- [ ] All test cases pass
- [ ] Performance is acceptable
- [ ] Accessibility standards are met
- [ ] Mobile experience is satisfactory

---

**QA Tester:** ________________  
**Date:** ________________  
**Version:** ________________  
**Notes:** ________________
