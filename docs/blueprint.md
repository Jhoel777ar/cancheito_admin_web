# **App Name**: AdminEdge

## Core Features:

- Secure Login: Authenticate admins using email and password against Firebase Realtime Database. Verifies 'usuario_verificado' status and prevents login for suspended accounts, displaying a suspension message if necessary.
- Dashboard Analytics: Display interactive charts and analytics summarizing user data and activity, offering insights into platform engagement.
- User Data Management: Enable admins to search users by email or full name, and view detailed user information, including profile URLs and registration details.
- User Account Control: Provide tools for admins to activate or suspend user accounts by updating the 'usuario_verificado' field in the Firebase Realtime Database, while also recording timestamps for all state changes. Uses reasoning about possible errors.
- Data Editing: Allow administrators to edit user data directly through the dashboard interface, ensuring real-time updates to the Firebase Realtime Database.
- Company Data View: Dedicated view for admins to view data from 'Empresas' (Companies) table.
- Job Offers View: Dedicated view for admins to view data from 'Ofertas' (Job Offers) table.

## Style Guidelines:

- Background color: Jet Black (#0D0D0D) with subtle acrylic/translucent overlay for a modern, elegant dark theme.
- Card background color: Dark Gray (#1E1E1E) with semi-transparent acrylic effect to differentiate cards from the background while maintaining depth and sophistication.
- Accent color: Warm Orange (#FF6F3C) for highlights, buttons, and key interactive elements, contrasting elegantly with the dark acrylic surfaces.
- Font: 'Inter' sans-serif for body and headlines, providing a modern, readable aesthetic.
- Minimalist icons from Material Icons to maintain consistency and clarity throughout the interface.
- Responsive grid layout to ensure optimal viewing and interaction across various screen sizes.
- Smooth transitions, hover effects, and subtle backdrop blur for buttons, cards, and interactive elements to enhance user experience with a refined acrylic feel.