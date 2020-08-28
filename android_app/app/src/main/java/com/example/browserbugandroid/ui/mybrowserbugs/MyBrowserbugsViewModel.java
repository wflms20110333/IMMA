package com.example.browserbugandroid.ui.mybrowserbugs;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

public class MyBrowserbugsViewModel extends ViewModel {

    private MutableLiveData<String> mText;

    public MyBrowserbugsViewModel() {
        mText = new MutableLiveData<>();
        mText.setValue("This is my browserbugs fragment");
    }

    public LiveData<String> getText() {
        return mText;
    }
}