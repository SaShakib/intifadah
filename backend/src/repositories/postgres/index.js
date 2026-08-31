const authRepository = require('./auth.repository');
const accessRepository = require('./access.repository');
const systemRepository = require('./system.repository');
const membersRepository = require('./members.repository');
const categoriesRepository = require('./categories.repository');
const transactionsRepository = require('./transactions.repository');
const loansRepository = require('./loans.repository');
const commentsRepository = require('./comments.repository');
const reportsRepository = require('./reports.repository');
const notificationsRepository = require('./notifications.repository');
const quranRepository = require('./quran.repository');

module.exports = {
  authRepository,
  accessRepository,
  systemRepository,
  membersRepository,
  categoriesRepository,
  transactionsRepository,
  loansRepository,
  commentsRepository,
  reportsRepository,
  notificationsRepository,
  quranRepository,
};
