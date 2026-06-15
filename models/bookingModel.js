// models/bookingModel.js

import { bookingsDb } from './_db.js';

export const BookingModel = {
    // create and persist new booking
  async create(booking) {
    return bookingsDb.insert({ ...booking, createdAt: new Date().toISOString() });
    },

    // find booking by id
  async findById(id) {
    return bookingsDb.findOne({ _id: id });
    },

    //list all users bookings by id
  async listByUser(userId) {
    return bookingsDb.find({ userId }).sort({ createdAt: -1 });
    },

    // list by session id
    async listBySession(sessionId) {
        return bookingsDb.find({ sessionIds: sessionId }).sort({ createdAt: -1 });
    },

    // update bookings status (to cancel)
  async cancel(id) {
    await bookingsDb.update({ _id: id }, { $set: { status: 'CANCELLED' } });
    return this.findById(id);
  }
};
``
