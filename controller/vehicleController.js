import Vehicle from "../model/vehicleModel.js";

const vehicleController = {
  createVehicle: async (req, res) => {
    try {
      const { date, comment, vehicleName, vehicleModel, location, amount } =
        req.body;
      if (
        !date ||
        !comment ||
        !vehicleName ||
        !vehicleModel ||
        !location ||
        !amount
      ) {
        return res.status(400).json({ error: "Required fields are missing" });
      }
      const newVehicle = new Vehicle({
        date,
        comment,
        vehicleName,
        vehicleModel,
        location,
        amount,
      });
      await newVehicle.save();
      res.status(201).json({ message: "Successfully added data" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getAllVehicle: async (req, res) => {
    try {
      const getData = await Vehicle.find();
      res.status(200).json(getData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get the data" });
    }
  },
  updateVehicle: async (req, res) => {
    try {
      const { date } = req.params;
      const { comment, vehicleName, vehicleModel, location, amount } = req.body;
      if (!comment || !vehicleName || !vehicleModel || !location || !amount) {
        return res.status(400).json({ error: "Required fields are missing" });
      }

      const updateVehicle = await Vehicle.findOneAndUpdate(
        { date },
        { comment, vehicleName, vehicleModel, location, amount },
        { new: true },
      );
      if (!updateVehicle) {
        return res
          .status(404)
          .json({ message: "Item not found for this date !!" });
      }
      res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update" });
    }
  },
};

export default vehicleController;
