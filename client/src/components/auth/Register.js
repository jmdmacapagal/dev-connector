import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { setAlert } from '../../actions/alert';
import PropTypes from 'prop-types';

const Register = ({ setAlert }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: ''
    });

    const { name, email, password, password2 } = formData;

    const changeHandler = e => {
        const { name, value } = e.target
        setFormData({
            ...formData, [name]: value
        });
    }

    const submitHandler = async e => {
        e.preventDefault();
        if (password !== password2) {
            setAlert('Passwords do not match', 'danger')
        } else {
           console.log('Success');
        }
    }

    return (
        <Fragment>
            <h1 className="large text-primary">Sign Up</h1>
            <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
            <form className="form" onSubmit={submitHandler}>
                <div className="form-group">
                    <input 
                    type="text" 
                    placeholder="Name" 
                    name="name"
                    value={name}
                    onChange={changeHandler} 
                    required />
                </div>
                <div className="form-group">
                    <input 
                    type="email" 
                    placeholder="Email Address" 
                    name="email" 
                    value={email}
                    onChange={changeHandler} 
                    required
                    />
                    <small className="form-text">
                        This site uses Gravatar so if you want a profile image, use a Gravatar email
                    </small>
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        minLength="6"
                        value={password}
                        onChange={changeHandler}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        name="password2"
                        minLength="6"
                        value={password2}
                        onChange={changeHandler}
                        required
                    />
                </div>
                <input type="submit" className="btn btn-primary" value="Register" />
            </form>
            <p className="my-1">
                Already have an account? <Link to="/login">Sign In</Link>
            </p>
        </Fragment>
    )
}

Register.propTypes = {
    setAlert: PropTypes.func.isRequired
};

export default connect(null, { setAlert })(Register)
