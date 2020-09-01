package com.example.browserbugandroid.ui.studio;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

public class StudioViewModel extends ViewModel {

    private MutableLiveData<String> mText;

    public StudioViewModel() {
        mText = new MutableLiveData<>();
        mText.setValue("This is my browserbugs fragment");
    }

    public LiveData<String> getText() {
        return mText;
    }
}