import Stores from "../schemas/StoresSchema";

class StoresController {
    static CreateShop = async (req, res, next) => {
        try {

        } catch (e) {
            res.status(400).json({
                error: e,
                description: e
            })
        }
    }
}

export default StoresController;