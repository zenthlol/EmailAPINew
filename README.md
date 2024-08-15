# Email API

API for sending an email to the client

## Deployment

To deploy this project to dev

```bash
  npm run start
```

To deploy this project to prod and run as a service

```bash
  node .\nodeService.js
```

## API Reference

#### Get all items

```http
  POST /sendmail
```

| Body      | Type     | Description                                     |
| :-------- | :------- | :---------------------------------------------- |
| `email`   | `string` | **Required**. Email to be send                  |
| `subject` | `string` | **Required**. Subject email                     |
| `body`    | `string` | **Required**. The body of email containing HTML |

More notes:
- schedule format = minute hour date month day-of-week
                  e.g = 15 10 31 5 *
                  => 31st May, 10:15 AM

-postman requests containing attachments = use form-data body format
