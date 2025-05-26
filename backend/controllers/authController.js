const login = async (req, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, 
        { expiresIn: '10d' }
    );
    res.status(200).json({ success: true, token, 
    user: {_id: user._id, name: user.name, role: user.role },
     });
} catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
};
const verify =(req, res) => {
    return res.status(200).json({ success: true, user: req.user })
}
export { login };

