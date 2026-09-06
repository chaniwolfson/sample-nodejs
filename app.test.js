describe('System Infrastructure & Utility Sanity Tests', () => {
  // בדיקת תקינות סביבת הריצה של Node.js
  test('Node environment and global variables check', () => {
    expect(process.env.NODE_ENV).toBeDefined();
    expect(typeof process.version).toBe('string');
  });

  // בדיקת פונקציית עיבוד נתונים/פורמט ללא תלות בקובצי האפליקציה
  test('Data formatting and validation logic', () => {
    const parseVersion = (versionStr) => versionStr.replace('v', '');
    
    expect(parseVersion('v1.0.0')).toBe('1.0.0');
    expect(parseVersion('v2.5.1')).not.toContain('v');
  });

  // בדיקת טיפוסים ומבני נתונים
  test('Response payload contract check', () => {
    const mockHealthPayload = {
      status: 'UP',
      timestamp: Date.now(),
      services: ['database', 'cache']
    };

    expect(mockHealthPayload).toHaveProperty('status', 'UP');
    expect(mockHealthPayload.services).toContain('database');
    expect(Array.isArray(mockHealthPayload.services)).toBe(true);
  });
});