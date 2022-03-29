db = db.getSiblingDB('santaiDB')
const res = db.createUser({
  user: 'santai',
  pwd: '1234',
  roles: [
    { role: 'readWrite', db: 'santaiDB' }
  ]
})