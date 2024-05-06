import Tyre from "../model/tyreModel.js";
const tyreStockController = {
  createTyre: async (req, res) => {
    try {
      const { date, tyreSize, comment, vehicle, location, amount, noOfTyres } =
        req.body;
      if (
        !date ||
        !tyreSize ||
        !comment ||
        !vehicle ||
        !location ||
        !amount ||
        !noOfTyres
      ) {
        return res.status(400).json({
          message:
            "Required fields missing !! date tyreSize comment quantity SSP location",
        });
      }

      const newTyre = new Tyre({
        date,
        tyreSize,
        comment,
        vehicle,
        location,
        amount,
        noOfTyres,
      });
      await newTyre.save();
      res.status(201).json({ message: "Successfully data added" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getAllTyres: async (req, res) => {
    try {
      const getData = await Tyre.find();
      res.status(201).json(getData);
    } catch (error) {
      res.status(500).json({ error: "Failed to get the data" });
    }
  },

  updateTyre: async (req, res) => {
    try {
      const { date } = req.params;
      const { tyreSize, comment, vehicle, location, amount, noOfTyres } =
        req.body;
      if (
        !tyreSize ||
        !comment ||
        !vehicle ||
        !location ||
        !amount ||
        !noOfTyres
      ) {
        return res.status(400).json({
          message:
            "Required fields missing !! tyreSize comment quantity SSP location",
        });
      }

      const updateTyre = await Tyre.findOneAndUpdate(
        { date },
        { tyreSize, comment, vehicle, location, amount, noOfTyres },
        { new: true },
      );
      if (!updateTyre) {
        return res
          .status(404)
          .json({ message: "Item not found for this date !!" });
      }
      res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update" });
    }
  },
};
export default tyreStockController;
