import express from 'express';
import Visit from '../models/Visit';
import Customer from '../models/Customer';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get visits
router.get('/', authenticate, async (req: any, res) => {
  try {
    const { date, status, customerId } = req.query;
    const query: any = {
      salespersonId: req.user._id,
      companyId: req.user.companyId,
      divisionId: req.user.divisionId
    };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.plannedDate = { $gte: startDate, $lt: endDate };
    }

    if (status) {
      query.status = status;
    }

    if (customerId) {
      query.customerId = customerId;
    }

    const visits = await Visit.find(query)
      .populate('customerId', 'name address phone')
      .sort({ plannedDate: 1 });

    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create visit
router.post('/', authenticate, async (req: any, res) => {
  try {
    const visitData = {
      ...req.body,
      salespersonId: req.user._id,
      vanId: req.user.vanId,
      companyId: req.user.companyId,
      divisionId: req.user.divisionId
    };

    const visit = new Visit(visitData);
    await visit.save();

    const populatedVisit = await Visit.findById(visit._id)
      .populate('customerId', 'name address phone');

    res.status(201).json(populatedVisit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check in to visit
router.post('/:id/checkin', authenticate, async (req: any, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    const visit = await Visit.findOne({
      _id: req.params.id,
      salespersonId: req.user._id
    });

    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (visit.status !== 'planned') {
      return res.status(400).json({ message: 'Visit cannot be checked in' });
    }

    // Get customer location for geofencing validation
    const customer = await Customer.findById(visit.customerId);
    if (customer) {
      const distance = calculateDistance(
        latitude, longitude,
        customer.location.latitude, customer.location.longitude
      );

      // Allow check-in within 100 meters
      if (distance > 0.1) {
        return res.status(400).json({ 
          message: 'You are too far from the customer location',
          distance: distance.toFixed(2) + ' km'
        });
      }
    }

    visit.status = 'completed';
    visit.actualDate = new Date();
    visit.checkInTime = new Date();
    visit.checkInLocation = { latitude, longitude };

    await visit.save();

    // Update customer last visit
    if (customer) {
      customer.lastVisit = new Date();
      await customer.save();
    }

    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check out from visit
router.post('/:id/checkout', authenticate, async (req: any, res) => {
  try {
    const { latitude, longitude, notes } = req.body;
    
    const visit = await Visit.findOne({
      _id: req.params.id,
      salespersonId: req.user._id
    });

    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (!visit.checkInTime) {
      return res.status(400).json({ message: 'Must check in before checking out' });
    }

    visit.checkOutTime = new Date();
    visit.checkOutLocation = { latitude, longitude };
    visit.notes = notes;

    await visit.save();
    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default router;