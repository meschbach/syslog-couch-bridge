A bridge between a syslog interface and CouchDB.

The current implementation is specifically targeted towards nginx access log processing, as this is my primary use case.

## Testing
The application is currently simple enough to test by hand (scandolous!).  As more features are added this will
inevitably change, however the ROI on fully automated tests is fairly low within this problem domain.

The included test application, `test.js`, will send a message to daemon so
you may ensure the system works as expected.

