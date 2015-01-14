A bridge between a syslog interface and CouchDB.

The current implementation is specifically targeted towards nginx access log processing, as this is my primary use case.

## Testing
The included test application, `test.js`, will send a message to daemon so
you may ensure the system works as expected.

## License
Apache 2, Copyright 2015 Mark Eschbach

### Binding to a specific interface
This application depends on chunpu/syslogd and unforunately can not support specific interface binding until https://github.com/chunpu/syslogd/pull/3 is merged.
