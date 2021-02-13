## Contents include:

1. mongodb.js; returning a function createConnection, optionally decorated with event listeners.

```javascript
exports.createConnection = () => {
  return mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
```
