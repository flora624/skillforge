// This is a temporary file to demonstrate the scroll fix
// The issue is with the left column scroll container

// The problem is in this section:
/*
<div style={{ 
    flex: '1 1 55%', 
    maxHeight: 'calc(100vh - 100px)',  // <- Change this to height
    overflowY: 'auto',
    paddingLeft: '20px',
    paddingRight: '10px'
}}>
*/

// Should be changed to:
/*
<div style={{ 
    flex: '1 1 55%', 
    height: 'calc(100vh - 100px)',     // <- Use height instead of maxHeight
    overflowY: 'auto',
    overflowX: 'hidden',               // <- Add this
    paddingLeft: '20px',
    paddingRight: '10px',
    scrollBehavior: 'smooth',          // <- Add this
    WebkitOverflowScrolling: 'touch',  // <- Add this for iOS
    scrollPaddingTop: '0px'            // <- Add this to fix scroll to top
}}>
*/

// The key changes are:
// 1. Change maxHeight to height
// 2. Add overflowX: 'hidden'
// 3. Add scrollBehavior: 'smooth'
// 4. Add WebkitOverflowScrolling: 'touch'
// 5. Add scrollPaddingTop: '0px'

// This will fix the issue where slow scrolling from bottom doesn't reach the top properly.